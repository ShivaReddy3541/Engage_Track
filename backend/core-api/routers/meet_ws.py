import json
import logging
from typing import Dict, List, Optional
from datetime import datetime

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from database import get_db
from shared.models import User, OnlineMeet, OnlineMeetSession
from security import SECRET_KEY, ALGORITHM

router = APIRouter()
logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        # meet_id -> { user_id -> WebSocket }
        self.active_connections: Dict[str, Dict[int, WebSocket]] = {}

    async def connect(self, websocket: WebSocket, meet_id: str, user_id: int):
        await websocket.accept()
        if meet_id not in self.active_connections:
            self.active_connections[meet_id] = {}
        self.active_connections[meet_id][user_id] = websocket

    def disconnect(self, meet_id: str, user_id: int):
        if meet_id in self.active_connections:
            if user_id in self.active_connections[meet_id]:
                del self.active_connections[meet_id][user_id]
            if not self.active_connections[meet_id]:
                del self.active_connections[meet_id]

    async def broadcast_to_meet(self, meet_id: str, message: dict, exclude_user_id: Optional[int] = None):
        if meet_id in self.active_connections:
            for uid, connection in self.active_connections[meet_id].items():
                if uid != exclude_user_id:
                    try:
                        await connection.send_json(message)
                    except Exception as e:
                        logger.error(f"Error broadcasting to {uid}: {e}")

    async def send_personal_message(self, message: dict, meet_id: str, user_id: int):
        if meet_id in self.active_connections and user_id in self.active_connections[meet_id]:
            try:
                await self.active_connections[meet_id][user_id].send_json(message)
            except Exception as e:
                logger.error(f"Error sending personal message to {user_id}: {e}")

manager = ConnectionManager()

def get_user_from_token(token: str, db: Session) -> User:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            return None
        user_id = int(user_id_str)
        user = db.query(User).filter(User.id == user_id).first()
        return user
    except (JWTError, ValueError):
        return None

@router.websocket("/ws/{meeting_id}")
async def websocket_endpoint(
    websocket: WebSocket, 
    meeting_id: str, 
    token: str = Query(...),
    db: Session = Depends(get_db)
):
    user = get_user_from_token(token, db)
    if not user:
        await websocket.close(code=1008, reason="Invalid token")
        return

    # Verify meeting exists and user is allowed
    meet = db.query(OnlineMeet).filter(OnlineMeet.meeting_id == meeting_id).first()
    if not meet:
        await websocket.close(code=1008, reason="Meeting not found")
        return
        
    if user.role == "student":
        user_section = getattr(user, "section", "A")
        if user.department != meet.department or user_section != meet.section:
            await websocket.close(code=1008, reason="Not authorized for this meeting section")
            return
    elif user.role == "teacher":
        if meet.teacher_id and meet.teacher_id not in [1, 0, user.id] and meet.department != getattr(user, "department", meet.department):
            await websocket.close(code=1008, reason="Not authorized for this department meeting")
            return

    # Handle session tracking
    session_record = db.query(OnlineMeetSession).filter(
        OnlineMeetSession.meet_id == meet.id,
        OnlineMeetSession.user_id == user.id
    ).first()

    now_str = datetime.utcnow().isoformat()
    if not session_record:
        session_record = OnlineMeetSession(
            meet_id=meet.id,
            user_id=user.id,
            session_token=f"sess_{user.id}_{meeting_id}",
            role=user.role,
            first_join_time=now_str
        )
        db.add(session_record)
        db.commit()
    else:
        # Rejoined, calculate absence if they had left
        if session_record.last_leave_time:
            leave_time = datetime.fromisoformat(session_record.last_leave_time)
            absence = (datetime.utcnow() - leave_time).total_seconds()
            session_record.total_absence_seconds += int(absence)
            session_record.last_leave_time = None  # Reset as they are back
            db.commit()

    await manager.connect(websocket, meeting_id, user.id)
    
    # Notify others that this user joined
    await manager.broadcast_to_meet(
        meeting_id, 
        {"type": "user_joined", "user_id": user.id, "name": user.full_name, "role": user.role},
        exclude_user_id=user.id
    )
    
    # Send existing users to the new user
    active_users = []
    if meeting_id in manager.active_connections:
        for uid in manager.active_connections[meeting_id]:
            if uid != user.id:
                u = db.query(User).filter(User.id == uid).first()
                if u:
                    active_users.append({"id": u.id, "name": u.full_name, "role": u.role})
                    
    await manager.send_personal_message(
        {"type": "room_state", "participants": active_users},
        meeting_id,
        user.id
    )

    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                msg_type = message.get("type")
                
                if msg_type == "signal":
                    # WebRTC signaling (offer/answer/ice-candidate)
                    target = message.get("target")
                    if target:
                        await manager.send_personal_message(
                            {"type": "signal", "sender": user.id, "signal_data": message.get("signal_data")}, 
                            meeting_id, target
                        )
                
                elif msg_type == "chat":
                    # Simple chat moderation
                    content = message.get("content", "")
                    # Dummy abuse check
                    abusive_words = ["abuse", "spam", "badword", "idiot", "stupid"]
                    is_abusive = any(word in content.lower() for word in abusive_words)
                    
                    if is_abusive:
                        await manager.send_personal_message(
                            {"type": "warning", "message": "Your message was flagged for inappropriate language."},
                            meeting_id, user.id
                        )
                    else:
                        await manager.broadcast_to_meet(
                            meeting_id,
                            {"type": "chat", "sender_name": user.full_name, "sender_id": user.id, "content": content}
                        )

                elif msg_type == "video_misconduct" or msg_type == "audio_abuse":
                    # Client AI agent reported misconduct
                    if user.role == "student":
                        session_record.beeps_count += 1
                        db.commit()
                        if session_record.beeps_count >= 4: # 3 beeps + 1 final kick
                            session_record.removal_reason = "Repeated AI monitor flags"
                            session_record.final_status = "Removed"
                            db.commit()
                            await manager.send_personal_message({"type": "kicked", "reason": "Repeated misconduct"}, meeting_id, user.id)
                            # close will happen automatically as client should disconnect
                        else:
                            await manager.send_personal_message(
                                {"type": "beep", "count": session_record.beeps_count, "reason": message.get("reason", "Inattentive or abusive behavior detected.")},
                                meeting_id, user.id
                            )
                            # notify teacher
                            if meet.teacher_id:
                                await manager.send_personal_message(
                                    {"type": "host_notification", "message": f"{user.full_name} triggered an AI warning ({session_record.beeps_count}/3)."},
                                    meeting_id, meet.teacher_id
                                )

                elif msg_type == "host_action" and user.id == meet.teacher_id:
                    # Mute all, request cam, kick
                    action = message.get("action")
                    target = message.get("target")
                    if action == "mute_all":
                        await manager.broadcast_to_meet(meeting_id, {"type": "mute_mic"}, exclude_user_id=user.id)
                    elif action == "request_camera" and target:
                        await manager.send_personal_message({"type": "request_camera"}, meeting_id, target)
                    elif action == "kick" and target:
                        # Record removal in DB
                        target_session = db.query(OnlineMeetSession).filter(OnlineMeetSession.meet_id == meet.id, OnlineMeetSession.user_id == target).first()
                        if target_session:
                            target_session.removal_reason = "Host removed"
                            target_session.final_status = "Removed"
                            db.commit()
                        await manager.send_personal_message({"type": "kicked", "reason": "Removed by Host"}, meeting_id, target)

            except json.JSONDecodeError:
                pass
            except Exception as e:
                logger.error(f"Error processing WS message: {e}")

    except WebSocketDisconnect:
        manager.disconnect(meeting_id, user.id)
        # Record leave time
        if session_record:
            session_record.last_leave_time = datetime.utcnow().isoformat()
            db.commit()
        await manager.broadcast_to_meet(
            meeting_id, 
            {"type": "user_left", "user_id": user.id}
        )
