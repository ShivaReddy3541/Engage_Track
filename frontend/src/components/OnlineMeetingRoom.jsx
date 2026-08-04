import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, VideoOff, Mic, MicOff, Users, MessageSquare, ShieldAlert, 
  PhoneOff, Share2, Hand, AlertTriangle, CheckCircle2, Lock, Clock, 
  Volume2, Eye, EyeOff, UserCheck, UserX, Award, RefreshCw, Radio,
  Send, AlertCircle, Settings, Play, X, Calendar
} from 'lucide-react';
import axios from 'axios';
const api = axios;
import AIProctorAgent from './AIProctorAgent';
import { useAuth } from '../hooks/useAuth';

// Web Audio API Synthesized Beep Generator
const playBeep = (freq = 600, duration = 600, type = 'sine') => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration / 1000);
  } catch (err) {
    console.error("Audio beep error:", err);
  }
};

export default function OnlineMeetingRoom({ meetData, userRole, onClose, onMeetingEnded }) {
  const { user } = useAuth();
  
  // Pre-join & Lifecycle States
  const [roomState, setRoomState] = useState('checking'); // checking, locked, waiting_room, active, ended
  const isHostOrAdmin = userRole === 'teacher' || userRole === 'admin' || userRole === 'dept_admin';
  const [accessMessage, setAccessMessage] = useState(
    isHostOrAdmin 
      ? `👨‍🏫 Faculty / Admin Portal: Initializing classroom controls...` 
      : 'Verifying student enrollment & classroom schedule...'
  );
  const [sessionToken, setSessionToken] = useState(null);
  
  // Hardware States
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const screenStreamRef = useRef(null);
  const originalVideoTrackRef = useRef(null);
  const [handRaised, setHandRaised] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const videoRef = useRef(null);
  
  // WebRTC & WebSocket Refs
  const ws = useRef(null);
  const peerConnections = useRef({});
  const [peerStreams, setPeerStreams] = useState({});

  useEffect(() => {
    if (videoRef.current) {
      if (isScreenSharing && screenStreamRef.current) {
        if (videoRef.current.srcObject !== screenStreamRef.current) {
          videoRef.current.srcObject = screenStreamRef.current;
          videoRef.current.play().catch(e => {});
        }
      } else if (localStream) {
        if (videoRef.current.srcObject !== localStream) {
          videoRef.current.srcObject = localStream;
          videoRef.current.play().catch(e => {});
        } else {
          // If already attached, just ensure it's playing
          videoRef.current.play().catch(e => {});
        }
      }
    }
  }, [localStream, isScreenSharing, roomState]);

  const latestLocalStream = useRef(null);
  useEffect(() => {
    latestLocalStream.current = localStream;
  }, [localStream]);

  useEffect(() => {
    return () => {
      if (ws.current) ws.current.close();
      Object.values(peerConnections.current).forEach(pc => pc.close());
      if (latestLocalStream.current) {
        latestLocalStream.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // UI Panels
  const [activeTab, setActiveTab] = useState('video'); // video, participants, chat, report
  const [viewMode, setViewMode] = useState('grid'); // grid, speaker
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'System AI Proctor', text: 'Welcome! This room is monitored by AI Proctoring for quality and academic integrity.', time: '10:00', isAi: true }
  ]);
  const [chatInput, setChatInput] = useState('');
  
  // Meeting & Proctoring Metrics
  const [absenceSecs, setAbsenceSecs] = useState(0);
  const [warningsCount, setWarningsCount] = useState(0);
  const [beepsCount, setBeepsCount] = useState(0);
  const [isAbsentNow, setIsAbsentNow] = useState(false);
  const [proctorToast, setProctorToast] = useState(null);
  const [cameraMandatory, setCameraMandatory] = useState(meetData?.camera_mandatory || false);
  const [postReport, setPostReport] = useState(null);
  const [cameraRequestModal, setCameraRequestModal] = useState(null);
  const [audioWarnings, setAudioWarnings] = useState(0);

  // Real Peer Participants fetched from database
  const [participants, setParticipants] = useState([]);

  // 1. Initial Access Check & Pre-Join Polling
  const checkAccess = async () => {
    // If user is already inside the active live room or meeting has ended, do not overwrite state!
    if (roomState === 'active' || roomState === 'ended') return;
    try {
      const meetId = meetData.meeting_id || meetData.id;
      const res = await api.get(`/api/academic/meets/${meetId}/join-check`);
      setRoomState(prev => (prev === 'active' || prev === 'ended') ? prev : res.data.status);
      setAccessMessage(res.data.message || 'Ready to join meeting.');
      if (res.data.participants && Array.isArray(res.data.participants)) {
        // Only relying on WebSocket for active participants to prevent offline ghosts
        // setParticipants(res.data.participants);
      }
      if (res.data.status === 'active' && isHostOrAdmin) {
        joinLiveRoom();
      }
    } catch (err) {
      if (err.response?.status === 401 || !sessionStorage.getItem('token')) {
        setRoomState('denied');
        setAccessMessage('🔒 Authentication Required: Please log in with your credentials to verify your student/teacher identity before joining this live classroom.');
        return;
      }
      if (isHostOrAdmin) {
        setRoomState('active');
        setAccessMessage(`👨‍🏫 Faculty / Admin Portal: Ready to launch live classroom (${meetData.subject_name || meetData.topic || 'Live Session'}).`);
      } else {
        setRoomState(prev => (prev === 'active' || prev === 'ended') ? prev : 'denied');
        const roleNotice = user?.role === 'student'
          ? '🎓 Student Enrollment Notice: You do not have active whitelist access to this specific classroom section.'
          : 'Access check pending for your account role.';
        setAccessMessage(err.response?.data?.detail || roleNotice);
      }
    }
  };

  useEffect(() => {
    if (roomState === 'active' || roomState === 'ended') return;
    checkAccess();
    const interval = setInterval(() => {
      setRoomState(current => {
        if (current === 'waiting_room' || current === 'locked' || current === 'checking') {
          checkAccess();
        }
        return current;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [roomState]);

  const setupWebSocket = (meetId, stream) => {
    const token = sessionStorage.getItem('token');
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/meet/ws/${meetId}?token=${token}`;
    ws.current = new WebSocket(wsUrl);

    ws.current.onmessage = async (event) => {
      try {
        const message = JSON.parse(event.data);
        const { type } = message;

        if (type === 'chat') {
          setChatMessages(prev => [...prev, {
            id: Date.now(),
            sender: message.sender_name,
            text: message.content,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isAi: false
          }]);
        } else if (type === 'room_state') {
          setParticipants(prev => {
            const newParticipants = [...prev];
            if (message.participants && Array.isArray(message.participants)) {
              message.participants.forEach(activeUser => {
                if (!newParticipants.find(p => p.id === activeUser.id)) {
                  newParticipants.push({
                    id: activeUser.id,
                    name: activeUser.name,
                    role: activeUser.role,
                    video: false,
                    audio: false,
                    hand: false,
                    warnings: 0
                  });
                }
              });
            }
            return newParticipants;
          });
        } else if (type === 'user_joined') {
          setParticipants(prev => {
            if (prev.find(p => p.id === message.user_id)) return prev;
            return [...prev, {
              id: message.user_id,
              name: message.name,
              role: message.role,
              video: false,
              audio: false,
              hand: false,
              warnings: 0
            }];
          });
          
          const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
          peerConnections.current[message.user_id] = pc;
          
          pc.onicecandidate = e => {
            if (e.candidate && ws.current && ws.current.readyState === WebSocket.OPEN) {
              ws.current.send(JSON.stringify({ type: 'signal', target: message.user_id, signal_data: { type: 'ice', candidate: e.candidate } }));
            }
          };
          
          pc.ontrack = e => {
            setPeerStreams(prev => ({ ...prev, [message.user_id]: e.streams[0] }));
            setParticipants(prev => prev.map(p => p.id === message.user_id ? { ...p, video: true, audio: true } : p));
          };
          
          if (stream) {
            stream.getTracks().forEach(track => pc.addTrack(track, stream));
          }
          
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ type: 'signal', target: message.user_id, signal_data: offer }));
          }

        } else if (type === 'user_left') {
          setParticipants(prev => prev.filter(p => p.id !== message.user_id));
          if (peerConnections.current[message.user_id]) {
            peerConnections.current[message.user_id].close();
            delete peerConnections.current[message.user_id];
          }
          setPeerStreams(prev => {
            const newStreams = { ...prev };
            delete newStreams[message.user_id];
            return newStreams;
          });
        } else if (type === 'signal') {
          const senderId = message.sender;
          const signalData = message.signal_data;
          
          let pc = peerConnections.current[senderId];
          if (!pc) {
            pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
            peerConnections.current[senderId] = pc;
            
            pc.onicecandidate = e => {
              if (e.candidate && ws.current && ws.current.readyState === WebSocket.OPEN) {
                ws.current.send(JSON.stringify({ type: 'signal', target: senderId, signal_data: { type: 'ice', candidate: e.candidate } }));
              }
            };
            
            pc.ontrack = e => {
              setPeerStreams(prev => ({ ...prev, [senderId]: e.streams[0] }));
              setParticipants(prev => prev.map(p => p.id === senderId ? { ...p, video: true, audio: true } : p));
            };
            
            if (stream) {
              stream.getTracks().forEach(track => pc.addTrack(track, stream));
            }
          }
          
          if (signalData.type === 'offer') {
            await pc.setRemoteDescription(new RTCSessionDescription(signalData));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            if (ws.current && ws.current.readyState === WebSocket.OPEN) {
              ws.current.send(JSON.stringify({ type: 'signal', target: senderId, signal_data: answer }));
            }
          } else if (signalData.type === 'answer') {
            await pc.setRemoteDescription(new RTCSessionDescription(signalData));
          } else if (signalData.type === 'ice') {
            try { await pc.addIceCandidate(new RTCIceCandidate(signalData.candidate)); } catch (e) {}
          }
        } else if (type === 'kicked') {
          handleAutoRemove(message.reason || "You have been removed from the session by Host/AI.");
        } else if (type === 'mute_mic') {
          setAudioEnabled(false);
          if (stream) {
            stream.getAudioTracks().forEach(t => t.enabled = false);
          }
        }
      } catch (e) {
        console.error("WS parse error", e);
      }
    };
  };

  // 2. Join Live Room & Initialize Hardware
  const joinLiveRoom = async () => {
    let stream = null;
    const meetId = meetData.meeting_id || meetData.id;
    try {
      const res = await api.post(`/api/academic/meets/${meetId}/join`);
      setSessionToken(res.data.session_token);
      setRoomState('active');
      setCameraMandatory(res.data.camera_mandatory);
      if (res.data.participants && Array.isArray(res.data.participants)) {
        // setParticipants(res.data.participants);
      }

      // Start local hardware stream
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(e => {});
        }
      } catch (e) {
        console.warn("Camera/Mic access denied or unavailable:", e);
        alert("Camera failed to start! Your webcam might be in use by another app or blocked by Windows. Trying to connect with Microphone only...");
        setVideoEnabled(false);
        try {
          // Fallback to audio only
          stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
          setLocalStream(stream);
          alert("Microphone connected successfully!");
        } catch (audioErr) {
          console.error("Audio fallback failed:", audioErr);
          alert("Both Camera and Microphone failed. You are connected in view-only mode.");
        }
      }
      
      setupWebSocket(meetId, stream);
    } catch (err) {
      setRoomState('active');
      try {
        const pRes = await api.get(`/api/academic/meets/${meetId}/participants`);
        // if (pRes.data && Array.isArray(pRes.data)) setParticipants(pRes.data);
      } catch (e) {}
      setupWebSocket(meetId, stream);
    }
  };

  // 3. Heartbeat & Real-Time Absence Tracking
  useEffect(() => {
    if (roomState !== 'active') return;

    const timer = setInterval(() => {
      if (!isHostOrAdmin && isAbsentNow) {
        setAbsenceSecs(prev => prev + 1);
      }
    }, 1000);

    const heartbeatTimer = setInterval(async () => {
      try {
        const meetId = meetData.meeting_id || meetData.id;
        const hbRes = await api.post(`/api/academic/meets/${meetId}/heartbeat`, {
          session_token: sessionToken || 'token-demo',
          event_type: isAbsentNow ? 'leave' : 'rejoin',
          details: `Current absence: ${absenceSecs}s`
        });
        if (hbRes.data?.participants && Array.isArray(hbRes.data.participants)) {
          // setParticipants(hbRes.data.participants);
        }
      } catch (e) {
        console.error("Heartbeat error:", e);
      }
    }, 10000);

    return () => {
      clearInterval(timer);
      clearInterval(heartbeatTimer);
    };
  }, [roomState, sessionToken, isAbsentNow, absenceSecs]);

  // Handle Tab Switch / Window Blur Absence
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !isHostOrAdmin) {
        setIsAbsentNow(true);
        triggerProctorAlert('warning', 'Tab switch / background window detected! Please return to class.');
        handleAutoRemove("Removed automatically by AI Proctoring for switching tabs / minimizing window.");
      } else {
        setIsAbsentNow(false);
      }
    };
    window.addEventListener('visibilitychange', handleVisibilityChange);
    return () => window.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isHostOrAdmin]);

  // 4. AI Proctoring Trigger Function
  const triggerProctorAlert = async (type, reason) => {
    if (type === 'beep') {
      const nextBeep = beepsCount + 1;
      setBeepsCount(nextBeep);
      setWarningsCount(prev => prev + 1);
      
      // Play Synthesized Audio Beep based on severity
      if (nextBeep === 1) playBeep(600, 800, 'sine');
      else if (nextBeep === 2) playBeep(850, 1000, 'triangle');
      else if (nextBeep >= 3) playBeep(1100, 1400, 'sawtooth');

      setProctorToast({
        title: `🚨 AI Proctoring Beep #${nextBeep} Triggered`,
        msg: `${reason}. Please keep your face visible and stay attentive in class!`,
        level: nextBeep >= 3 ? 'critical' : 'warning'
      });

      try {
        const meetId = meetData.meeting_id || meetData.id;
        if (sessionToken) {
          await api.post(`/api/academic/meets/${meetId}/heartbeat`, {
            session_token: sessionToken,
            event_type: 'beep',
            details: `Beep #${nextBeep}: ${reason}`
          });
        }
      } catch (e) {}

      // Auto-Remove on Step 4
      if (nextBeep >= 4 && !isHostOrAdmin) {
        handleAutoRemove("Removed automatically by AI Proctoring after 3 consecutive inactivity/sleeping warnings.");
      }
    } else if (type === 'warning') {
      setWarningsCount(prev => prev + 1);
      setProctorToast({
        title: '⚠️ AI Conduct Warning',
        msg: reason,
        level: 'warning'
      });
    } else if (type === 'chat_abuse') {
      setWarningsCount(prev => prev + 1);
      setProctorToast({
        title: '🚫 Profanity & Conduct Violation',
        msg: reason,
        level: 'critical'
      });
      try {
        const meetId = meetData.meeting_id || meetData.id;
        if (sessionToken) {
          await api.post(`/api/academic/meets/${meetId}/heartbeat`, {
            session_token: sessionToken,
            event_type: 'chat_abuse',
            details: reason
          });
        }
      } catch (e) {}
    } else if (type === 'camera_off') {
      setWarningsCount(prev => prev + 1);
      setProctorToast({
        title: '📷 Mandatory Camera Check Failed',
        msg: reason,
        level: 'critical'
      });
      try {
        const meetId = meetData.meeting_id || meetData.id;
        if (sessionToken) {
          await api.post(`/api/academic/meets/${meetId}/heartbeat`, {
            session_token: sessionToken,
            event_type: 'camera_violation',
            details: reason
          });
        }
      } catch (e) {}
    } else if (type === 'audio_abuse') {
      const nextAudioWarnings = audioWarnings + 1;
      setAudioWarnings(nextAudioWarnings);
      setWarningsCount(prev => prev + 1);
      setAudioEnabled(false);
      setProctorToast({
        title: '🎙️ AI Audio Abuse Detected & Auto-Muted',
        msg: `${reason} (Warning #${nextAudioWarnings})`,
        level: 'critical'
      });
      if (nextAudioWarnings >= 2 && !isHostOrAdmin) {
        handleAutoRemove("Removed automatically by AI Audio Monitoring after repeated inappropriate/abusive speech warnings.");
      }
    }
  };

  const triggerCameraRequestToStudent = (studentName) => {
    setCameraRequestModal({
      studentName,
      timeLeft: 15
    });
  };

  useEffect(() => {
    if (!cameraRequestModal) return;
    const timer = setInterval(() => {
      setCameraRequestModal(prev => {
        if (!prev) return null;
        if (prev.timeLeft <= 1) {
          triggerProctorAlert('camera_off', 'Failed to turn on camera within 15 seconds of Host request.');
          return null;
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cameraRequestModal]);

  const handleAutoRemove = async (reason) => {
    try {
      const meetId = meetData.meeting_id || meetData.id;
      if (sessionToken) {
        await api.post(`/api/academic/meets/${meetId}/heartbeat`, {
          session_token: sessionToken,
          event_type: 'auto_remove',
          details: reason
        });
      }
    } catch (e) {}
    alert(`[AI PROCTORING ACTION]: ${reason}`);
    onClose();
  };

  // Chat Submission & AI Moderation
  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'chat', content: chatInput }));
      setChatInput('');
    } else {
      const newMsg = {
        id: Date.now(),
        sender: isHostOrAdmin ? `${meetData?.teacher_name || 'Host'} (Host)` : 'You',
        text: chatInput,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAi: false
      };
      setChatMessages([...chatMessages, newMsg]);
      setChatInput('');
    }
  };

  // Host Action Controls
  const handleHostAction = async (actionType, targetUserId = null, payload = {}) => {
    try {
      const meetId = meetData.meeting_id || meetData.id;
      if (actionType === 'mute_all') {
        setParticipants(prev => prev.map(p => p.role === 'student' ? { ...p, audio: false } : p));
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify({ type: 'host_action', action: 'mute_all' }));
        }
        alert("All student microphones have been muted by Host.");
      } else if (actionType === 'toggle_mandatory') {
        const res = await api.post(`/api/academic/meets/${meetId}/action`, { action: 'toggle_camera_mandatory' });
        setCameraMandatory(res.data.camera_mandatory);
      } else if (actionType === 'request_camera') {
        if (targetUserId === 'me' || !isHostOrAdmin) {
          triggerCameraRequestToStudent('You (Student)');
        } else {
          const peer = participants.find(p => p.id === targetUserId);
          alert(`[HOST CONTROL]: Sent 'Camera ON Request' to student ${peer?.name || targetUserId}. They have 15 seconds to accept or incur proctor penalties.`);
          if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ type: 'host_action', action: 'request_camera', target: targetUserId }));
          }
          triggerCameraRequestToStudent(peer?.name || 'Student');
        }
      } else if (actionType === 'remove_student') {
        await api.post(`/api/academic/meets/${meetId}/action`, {
          action: 'remove_student',
          target_user_id: targetUserId,
          payload: { reason: payload.reason || 'Host Teacher removed student from room.' }
        });
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify({ type: 'host_action', action: 'kick', target: targetUserId }));
        }
        setParticipants(prev => prev.filter(p => p.id !== targetUserId));
      } else if (actionType === 'end_meeting') {
        const res = await api.post(`/api/academic/meets/${meetId}/end`);
        setPostReport(res.data.report);
        setRoomState('ended');
        if (onMeetingEnded) onMeetingEnded(res.data.report);
      }
    } catch (err) {
      alert("Host action failed: " + (err.response?.data?.detail || err.message));
    }
  };

  const toggleVideo = () => {
    if (cameraMandatory && videoEnabled && !isHostOrAdmin) {
      triggerProctorAlert('warning', 'Camera is set to MANDATORY by the Host Teacher. Turning it off will incur absence/warnings!');
    }
    const nextState = !videoEnabled;
    setVideoEnabled(nextState);
    if (localStream) {
      localStream.getVideoTracks().forEach(t => t.enabled = nextState);
    }
    if (!nextState && !isHostOrAdmin) {
      setIsAbsentNow(true);
    } else {
      setIsAbsentNow(false);
    }
  };

  const toggleAudio = () => {
    const nextState = !audioEnabled;
    setAudioEnabled(nextState);
    if (localStream) {
      localStream.getAudioTracks().forEach(t => t.enabled = nextState);
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        // Start Screen Share
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = screenStream;
        const screenTrack = screenStream.getVideoTracks()[0];

        // Store original video track if it exists
        if (localStream) {
          originalVideoTrackRef.current = localStream.getVideoTracks()[0];
        }

        // Replace track in all peer connections
        Object.values(peerConnections.current).forEach(pc => {
          const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
          if (sender) {
            sender.replaceTrack(screenTrack);
          }
        });

        setIsScreenSharing(true);
        setViewMode('speaker'); // Auto switch to speaker view for presentation

        // Listen for user stopping screen share via browser UI
        screenTrack.onended = () => {
          stopScreenShare();
        };
      } else {
        stopScreenShare();
      }
    } catch (err) {
      console.error("Screen sharing failed:", err);
      alert("Failed to start screen sharing. Permission denied or not supported.");
    }
  };

  const stopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(t => t.stop());
      screenStreamRef.current = null;
    }
    setIsScreenSharing(false);
    
    // Restore original webcam track
    if (originalVideoTrackRef.current) {
      Object.values(peerConnections.current).forEach(pc => {
        const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
        if (sender) {
          sender.replaceTrack(originalVideoTrackRef.current);
        }
      });
    }
  };

  // Format Time Helper
  const formatSecs = (totalSecs) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // ==========================================
  // RENDER PRE-JOIN / WAITING ROOM / LOCKED
  // ==========================================
  if (roomState !== 'active' && !postReport) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-6 font-sans">
        <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -z-10"></div>
          
          <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shadow-lg">
            {roomState === 'locked' ? <Lock className="h-8 w-8 text-amber-400" /> : <Clock className="h-8 w-8 text-emerald-400 animate-pulse" />}
          </div>

          <div>
            <span className="px-3 py-1 bg-slate-800 text-slate-300 text-xs font-bold uppercase rounded-full border border-slate-700">
              {meetData.department} - Section {meetData.section}
            </span>
            <h2 className="text-2xl font-black text-white mt-3">{meetData.topic || meetData.subject_name}</h2>
            <p className="text-slate-400 text-sm mt-1">Instructor: <span className="text-white font-bold">{meetData.teacher_name && meetData.teacher_name !== 'Faculty Instructor' ? meetData.teacher_name : 'Dr. Rajesh Kumar (Faculty Member)'}</span></p>
          </div>

          <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-300 font-bold border-b border-slate-800/80 pb-3">
              <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-brand-400" /> Date & Time:</span>
              <span>{meetData.meet_date} at {meetData.start_time}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-300 font-bold border-b border-slate-800/80 pb-3">
              <span className="flex items-center gap-1.5"><ShieldAlert className="h-3.5 w-3.5 text-emerald-400" /> Absence Limit:</span>
              <span className="text-emerald-400">{meetData.absence_limit_mins || 15} mins max</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
              <span className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5 text-amber-400" /> AI Proctoring:</span>
              <span className="text-amber-400">Active (Face & Audio Monitored)</span>
            </div>
          </div>

          <div className={`p-5 rounded-2xl border font-extrabold text-sm sm:text-base tracking-wide shadow-lg ${
            roomState === 'denied' || (accessMessage && (accessMessage.toLowerCase().includes('not found') || accessMessage.toLowerCase().includes('denied') || accessMessage.toLowerCase().includes('error') || accessMessage.toLowerCase().includes('authentication required')))
              ? 'bg-rose-950/90 border-rose-400 text-rose-100 shadow-rose-900/40'
              : 'bg-emerald-950/90 border-emerald-400 text-emerald-100 shadow-emerald-900/40'
          }`}>
            <div className="flex items-center justify-center gap-2">
              <span>{accessMessage || 'Connecting to secure live classroom server...'}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 pt-2 flex-wrap">
            {(roomState === 'denied' || !sessionStorage.getItem('token') || (accessMessage && accessMessage.toLowerCase().includes('authentication required'))) && (
              <a 
                href="/login"
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
              >
                🔐 Sign In / Go to Login
              </a>
            )}
            {(isHostOrAdmin || roomState === 'waiting_room' || roomState === 'active' || roomState === 'checking' || roomState === 'locked') && (
              <button 
                onClick={joinLiveRoom}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2"
              >
                {isHostOrAdmin ? '🟢 Launch & Enter Live Room ->' : '🟢 Enter Live Classroom Now ->'}
              </button>
            )}
            <button 
              onClick={onClose}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm rounded-xl transition-all border border-slate-700"
            >
              Exit Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER POST-CLASS REPORT MODAL
  // ==========================================
  if (postReport) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-6 font-sans">
        <div className="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between pb-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg">
                📋
              </div>
              <div>
                <h2 className="text-xl font-black text-white">Post-Class Attendance & Proctoring Report</h2>
                <p className="text-slate-400 text-xs mt-0.5">{postReport.topic} | {postReport.department} Section {postReport.section}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 border border-slate-700">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 my-6">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
              <p className="text-slate-400 text-xs font-bold uppercase">Total Enrolled</p>
              <p className="text-2xl font-black text-white mt-1">{postReport.total_participants}</p>
            </div>
            <div className="bg-emerald-950/30 p-4 rounded-2xl border border-emerald-500/30 text-center">
              <p className="text-emerald-400 text-xs font-bold uppercase">Present Students</p>
              <p className="text-2xl font-black text-emerald-400 mt-1">{postReport.present_count}</p>
            </div>
            <div className="bg-red-950/30 p-4 rounded-2xl border border-red-500/30 text-center">
              <p className="text-red-400 text-xs font-bold uppercase">Absent / Removed</p>
              <p className="text-2xl font-black text-red-400 mt-1">{postReport.absent_count}</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Student & Roll No</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Absence Time</th>
                  <th className="py-3 px-4">AI Warnings / Beeps</th>
                  <th className="py-3 px-4 text-right">Final Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {postReport.participants?.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-bold text-white">{p.name}</p>
                      <p className="text-[11px] font-mono text-slate-400">{p.roll_number}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 uppercase">
                        {p.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {p.absence_formatted}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        {p.warnings_count} Warns / {p.beeps_count} Beeps
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        p.final_status.includes('Present') || p.final_status.includes('Exempt')
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-red-500/20 text-red-400 border-red-500/30'
                      }`}>
                        {p.final_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {postReport.recording_url && (
            <div className="mt-6 p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <Radio className="h-5 w-5 text-red-500 animate-pulse" />
                <div>
                  <p className="text-white text-xs font-bold">Automatic Recording Saved & Encrypted</p>
                  <p className="text-slate-400 text-[11px] font-mono mt-0.5">{postReport.recording_url}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-lg">
                  Attached to Browse Feed
                </span>
                <button 
                  onClick={() => window.open(postReport.recording_url, '_blank')}
                  className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-lg shadow transition-all flex items-center gap-1.5"
                >
                  ▶ Watch Recording
                </button>
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-slate-800 mt-6 flex justify-end">
            <button 
              onClick={onClose}
              className="px-8 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm rounded-xl shadow-lg transition-all"
            >
              Close & Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER ACTIVE LIVE CLASSROOM
  // ==========================================
  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col font-sans overflow-hidden animate-fadeIn">
      
      {/* 1. TOP HEADER & METRICS BAR */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            LIVE REC
          </div>
          <div>
            <h1 className="text-white font-black text-sm flex items-center gap-2">
              {meetData.topic || meetData.subject_name}
              <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] rounded-full border border-slate-700">
                {meetData.department} {meetData.section}
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* AI Proctor Status */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-bold">
            <ShieldAlert className="h-4 w-4 text-emerald-400" />
            <span className="text-slate-300">AI Proctor:</span>
            <span className="text-emerald-400 font-mono">ACTIVE</span>
            {cameraMandatory && (
              <span className="ml-1 px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-[9px] rounded uppercase">Cam Mandatory</span>
            )}
          </div>

          {/* Student Absence Limit Tracker */}
          {!isHostOrAdmin && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${
              absenceSecs > (meetData.absence_limit_mins || 15) * 60 
                ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                : 'bg-slate-950 text-slate-300 border-slate-800'
            }`}>
              <Clock className="h-4 w-4 text-slate-400" />
              <span>Absence:</span>
              <span className="font-mono text-white">{formatSecs(absenceSecs)}</span>
              <span className="text-slate-500">/ {meetData.absence_limit_mins || 15}m max</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold text-white border border-slate-700">
            <Users className="h-4 w-4 text-slate-400" />
            <span>{participants.length + 1} Online</span>
          </div>
        </div>
      </header>

      {/* AI ETHICS & PRIVACY COMPLIANCE BANNER (MANDATORY REQUIREMENT) */}
      <div className="bg-indigo-950/80 border-b border-indigo-800/60 px-4 py-2 flex items-center justify-between text-xs shrink-0 shadow-sm">
        <div className="flex items-center gap-2 text-indigo-200">
          <span className="p-1 rounded bg-indigo-500/20 text-indigo-400 font-bold"><ShieldAlert className="h-3.5 w-3.5" /></span>
          <span><strong>Ethics & Privacy Compliance:</strong> This session is AI monitored for quality and discipline. No hidden camera activation.</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className="text-emerald-400 flex items-center gap-1.5 font-bold">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Camera Indicator Always Visible
          </span>
        </div>
      </div>

      {/* CAMERA ON REQUEST MODAL (STUDENT EXPERIENCE) */}
      {cameraRequestModal?.active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-slate-900 border-2 border-indigo-500 rounded-3xl max-w-md w-full p-6 shadow-2xl text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-pulse" />
            
            <div className="h-16 w-16 bg-indigo-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-500/40 text-indigo-400">
              <Video className="h-8 w-8 animate-bounce" />
            </div>

            <h3 className="text-lg font-black text-white">Teacher Requested Camera ON!</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              The Host Teacher (<span className="text-white font-bold">{meetData?.teacher_name || 'Host'}</span>) has requested that <span className="font-bold text-indigo-400">{cameraRequestModal.targetName}</span> turn on the camera immediately for AI proctoring compliance.
            </p>

            <div className="my-4 py-3 px-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between font-mono text-sm">
              <span className="text-slate-400 flex items-center gap-1.5"><Clock className="h-4 w-4 text-amber-400" /> Time to Accept:</span>
              <span className={`font-black ${cameraRequestModal.countdown <= 5 ? 'text-red-400 animate-ping' : 'text-emerald-400'}`}>
                {cameraRequestModal.countdown} seconds
              </span>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  triggerProctorAlert('warning', 'You declined the Host Teacher camera request. Warning recorded.');
                  setCameraRequestModal(null);
                }}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition-all"
              >
                Decline (Incur Penalty)
              </button>
              <button
                onClick={() => {
                  setVideoEnabled(true);
                  setIsAbsentNow(false);
                  setCameraRequestModal(null);
                  alert("Camera successfully activated for AI proctoring verification!");
                }}
                className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
              >
                Accept & Turn Camera ON
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROCTOR WARNING TOAST POPUP */}
      {proctorToast && (
        <div className={`absolute top-20 left-1/2 -translate-x-1/2 z-50 max-w-lg w-full p-4 rounded-2xl shadow-2xl border flex items-start gap-3 animate-bounce ${
          proctorToast.level === 'critical' ? 'bg-red-900 border-red-500 text-white' : 'bg-amber-900/90 border-amber-500 text-white'
        }`}>
          <AlertTriangle className="h-6 w-6 shrink-0 mt-0.5 text-amber-300" />
          <div className="flex-1">
            <p className="font-bold text-sm">{proctorToast.title}</p>
            <p className="text-xs mt-1 text-slate-100">{proctorToast.msg}</p>
          </div>
          <button onClick={() => setProctorToast(null)} className="text-slate-300 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 2. MAIN WORKSPACE */}
      <div className="flex-1 flex overflow-hidden bg-slate-950">
        
        {/* VIDEO GRID AREA */}
        <div className="flex-1 p-4 flex flex-col overflow-hidden relative">
          
          <AIProctorAgent 
            videoRef={videoRef}
            isHostOrAdmin={isHostOrAdmin}
            isActive={roomState === 'active'}
            onViolation={(type, reason) => triggerProctorAlert(type, reason)}
          />

          {viewMode === 'grid' ? (
            <div className="flex-1 grid grid-cols-3 gap-4 overflow-y-auto pr-1">
              {/* Local User Tile */}
              <div className="bg-slate-900 rounded-2xl border-2 border-slate-800 relative overflow-hidden flex flex-col justify-between p-4 min-h-[220px] shadow-lg">
                <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                  <span className="px-2 py-0.5 rounded bg-slate-800/80 backdrop-blur text-white text-[10px] font-bold border border-slate-700">
                    You ({isHostOrAdmin ? userRole : 'Student'})
                  </span>
                  {videoEnabled ? (
                    <span className="p-1 rounded bg-emerald-500/20 text-emerald-400"><Video className="h-3.5 w-3.5" /></span>
                  ) : (
                    <span className="p-1 rounded bg-red-500/20 text-red-400"><VideoOff className="h-3.5 w-3.5" /></span>
                  )}
                </div>

                <div className="flex-1 flex items-center justify-center relative my-4">
                  <video 
                    ref={el => {
                      videoRef.current = el;
                      if (el && localStream && el.srcObject !== localStream) {
                        el.srcObject = localStream;
                        el.play().catch(e => console.warn("AutoPlay blocked", e));
                      }
                    }}
                    autoPlay 
                    muted 
                    playsInline 
                    className={`w-full h-full object-cover rounded-xl absolute inset-0 bg-slate-950 ${videoEnabled ? '' : 'hidden'}`} 
                  />
                  {!videoEnabled && (
                    <div className="text-center relative z-10 w-full h-full flex flex-col items-center justify-center bg-slate-900 rounded-xl">
                      <div className="h-20 w-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-2 border border-slate-700 shadow-xl">
                        <UserCheck className="h-8 w-8 text-slate-400" />
                      </div>
                      <p className="text-white font-bold text-xs">Camera is OFF</p>
                      {cameraMandatory && !isHostOrAdmin && (
                        <p className="text-red-400 text-[10px] font-bold mt-1 animate-pulse">Please enable for attendance!</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between z-10 pt-2 border-t border-slate-800/80 text-xs">
                  <span className="font-bold text-white truncate">{meetData.teacher_name && isHostOrAdmin ? meetData.teacher_name : 'Your Video Feed'}</span>
                  <div className="flex items-center gap-2">
                    {handRaised && <span className="bg-amber-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full animate-bounce">✋ Hand Raised</span>}
                    {audioEnabled ? <Mic className="h-3.5 w-3.5 text-emerald-400" /> : <MicOff className="h-3.5 w-3.5 text-red-400" />}
                  </div>
                </div>
              </div>

              {/* Peer Participants Grid */}
              {participants.filter(peer => peer.id !== user?.id).map((peer) => (
                <div key={peer.id} className="bg-slate-900 rounded-2xl border-2 border-slate-800 relative overflow-hidden flex flex-col justify-between p-4 min-h-[220px] shadow-lg hover:border-slate-700 transition-all">
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                    <span className="px-2 py-0.5 rounded bg-slate-800/80 backdrop-blur text-slate-300 text-[10px] font-bold border border-slate-700 uppercase">
                      {peer.role}
                    </span>
                    {peer.hand && <span className="p-1 rounded bg-amber-500/20 text-amber-400 animate-bounce"><Hand className="h-3.5 w-3.5" /></span>}
                  </div>

                  <div className="flex-1 flex items-center justify-center relative">
                    {peer.video || peerStreams[peer.id] ? (
                      peerStreams[peer.id] ? (
                        <video
                          autoPlay
                          playsInline
                          ref={el => { if (el && el.srcObject !== peerStreams[peer.id]) el.srcObject = peerStreams[peer.id]; }}
                          className="w-full h-full object-cover rounded-xl absolute inset-0 bg-slate-950"
                        />
                      ) : (
                        <div className="text-center relative w-full h-full flex items-center justify-center bg-slate-950/60 rounded-xl">
                          <div className="h-16 w-16 bg-gradient-to-tr from-brand-600 to-emerald-600 rounded-full flex items-center justify-center font-black text-white text-lg shadow-xl">
                            {peer.name.split(' ').map(n=>n[0]).join('').substring(0,2)}
                          </div>
                          {peer.audio && (
                            <span className="absolute bottom-3 right-3 px-2 py-0.5 bg-emerald-500 text-slate-950 text-[9px] font-bold rounded-full animate-pulse">
                              Speaking...
                            </span>
                          )}
                        </div>
                      )
                    ) : (
                      <div className="text-center">
                        <div className="h-16 w-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-2 border border-slate-700">
                          <UserX className="h-6 w-6 text-slate-500" />
                        </div>
                        <p className="text-slate-400 text-xs font-bold">{peer.name}</p>
                        <p className="text-slate-600 text-[10px]">Camera Disabled</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                    <span className="font-bold text-white truncate">{peer.name}</span>
                    <div className="flex items-center gap-1.5">
                      {peer.warnings > 0 && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400">
                          ⚠️ {peer.warnings}
                        </span>
                      )}
                      {peer.audio ? <Mic className="h-3.5 w-3.5 text-emerald-400" /> : <MicOff className="h-3.5 w-3.5 text-slate-500" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Speaker / Presentation View */
            <div className="flex-1 bg-slate-900 rounded-2xl border-2 border-slate-800 flex items-center justify-center p-8 text-center relative shadow-inner">
              <div>
                <div className="h-32 w-32 bg-brand-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-brand-400/30 shadow-2xl">
                  <UserCheck className="h-14 w-14 text-white" />
                </div>
                <h2 className="text-xl font-black text-white">{meetData.teacher_name || 'Faculty Instructor'} (Host)</h2>
                <p className="text-emerald-400 font-bold text-xs mt-1">Active Speaker & Presentation Stream</p>
              </div>
            </div>
          )}

        </div>

        {/* SIDEBAR TABS (Participants / Chat / Host Controls) */}
        <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0">
          <div className="flex border-b border-slate-800 bg-slate-950">
            <button 
              onClick={() => setActiveTab('video')}
              className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${activeTab === 'video' ? 'text-brand-400 border-b-2 border-brand-400 bg-slate-900' : 'text-slate-400 hover:text-white'}`}
            >
              <Users className="h-4 w-4" /> Participants ({participants.length + 1})
            </button>
            <button 
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${activeTab === 'chat' ? 'text-brand-400 border-b-2 border-brand-400 bg-slate-900' : 'text-slate-400 hover:text-white'}`}
            >
              <MessageSquare className="h-4 w-4" /> Live Chat
            </button>
            {isHostOrAdmin && (
              <button 
                onClick={() => setActiveTab('host')}
                className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${activeTab === 'host' ? 'text-brand-400 border-b-2 border-brand-400 bg-slate-900' : 'text-slate-400 hover:text-white'}`}
              >
                <Settings className="h-4 w-4" /> Host
              </button>
            )}
          </div>

          {/* TAB 1: PARTICIPANTS LIST */}
          {activeTab === 'video' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-white text-xs font-bold">You ({isHostOrAdmin ? 'Host' : 'Student'})</p>
                  <p className="text-slate-500 text-[10px] font-mono">{userRole.toUpperCase()}</p>
                </div>
                <div className="flex items-center gap-2">
                  {handRaised && <span className="text-xs">✋</span>}
                  {audioEnabled ? <Mic className="h-3.5 w-3.5 text-emerald-400" /> : <MicOff className="h-3.5 w-3.5 text-red-400" />}
                  {videoEnabled ? <Video className="h-3.5 w-3.5 text-emerald-400" /> : <VideoOff className="h-3.5 w-3.5 text-red-400" />}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Peer List ({participants.length})
              </div>

              {participants.map((p) => (
                <div key={p.id} className="p-3 bg-slate-950/60 hover:bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between transition-colors">
                  <div className="flex-1 truncate mr-2">
                    <p className="text-white text-xs font-bold truncate">{p.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-mono text-slate-400">{p.role === 'student' ? 'Student' : (p.role === 'teacher' ? 'Faculty' : (p.role || 'Participant'))}</span>
                      {p.absenceSecs > 0 && (
                        <span className="text-[9px] font-bold text-amber-400">
                          Absence: {formatSecs(p.absenceSecs)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {p.hand && <span className="text-xs animate-bounce">✋</span>}
                    {p.warnings > 0 && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        {p.warnings}W / {p.beeps}B
                      </span>
                    )}
                    {p.audio ? <Mic className="h-3.5 w-3.5 text-emerald-400" /> : <MicOff className="h-3.5 w-3.5 text-slate-600" />}
                    {isHostOrAdmin && p.role === 'student' && (
                      <div className="flex items-center gap-1 ml-1">
                        <button 
                          onClick={() => handleHostAction('request_camera', p.id)}
                          className="px-2 py-1 text-[10px] font-bold bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 rounded-lg transition-all flex items-center gap-1"
                          title="Send Camera ON Request to Student"
                        >
                          <Video className="h-3 w-3" /> Req Cam
                        </button>
                        <button 
                          onClick={() => handleHostAction('remove_student', p.id, { reason: 'Host Teacher removed participant.' })}
                          className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                          title="Remove Student"
                        >
                          <UserX className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: LIVE CHAT */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`p-3 rounded-2xl text-xs space-y-1 ${
                    msg.isAi ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300' : 'bg-slate-950 border border-slate-800 text-slate-200'
                  }`}>
                    <div className="flex items-center justify-between font-bold">
                      <span className={msg.isAi ? 'text-amber-400 flex items-center gap-1' : 'text-brand-400'}>
                        {msg.isAi && <ShieldAlert className="h-3.5 w-3.5" />} {msg.sender}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{msg.time}</span>
                    </div>
                    <p className="leading-relaxed">{msg.text}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendChat} className="p-3 border-t border-slate-800 bg-slate-950 flex gap-2">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type message to room..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                />
                <button type="submit" className="px-3 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold transition-all">
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: HOST CONTROLS CONSOLE */}
          {activeTab === 'host' && isHostOrAdmin && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-xs text-brand-300 font-medium leading-relaxed">
                As the Host Instructor, your actions immediately govern all student feeds and proctoring rules.
              </div>

              <div className="space-y-2">
                <button 
                  onClick={() => handleHostAction('mute_all')}
                  className="w-full py-3 px-4 bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs rounded-xl border border-slate-800 flex items-center justify-between transition-all"
                >
                  <span className="flex items-center gap-2"><Volume2 className="h-4 w-4 text-emerald-400" /> Mute All Students</span>
                  <span className="text-[10px] text-slate-400 uppercase">Action</span>
                </button>

                <button 
                  onClick={() => handleHostAction('toggle_mandatory')}
                  className={`w-full py-3 px-4 rounded-xl border font-bold text-xs flex items-center justify-between transition-all ${
                    cameraMandatory ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-slate-950 text-white border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-2"><Video className="h-4 w-4" /> Force Camera Mandatory</span>
                  <span className="text-[10px] font-mono">{cameraMandatory ? 'ON' : 'OFF'}</span>
                </button>

                <button 
                  onClick={() => setViewMode(viewMode === 'grid' ? 'speaker' : 'grid')}
                  className="w-full py-3 px-4 bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs rounded-xl border border-slate-800 flex items-center justify-between transition-all"
                >
                  <span className="flex items-center gap-2"><Users className="h-4 w-4 text-brand-400" /> Layout View Mode</span>
                  <span className="text-[10px] text-brand-400 uppercase font-mono">{viewMode}</span>
                </button>

                <button 
                  onClick={() => handleHostAction('end_meeting')}
                  className="w-full py-3 px-4 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 mt-6 transition-all"
                >
                  <PhoneOff className="h-4 w-4" /> End Meeting for All & Generate Report
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* 3. BOTTOM HARDWARE CONTROL BAR */}
      <footer className="h-20 bg-slate-900 border-t border-slate-800 flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-3 w-64">
          <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
          <div>
            <p className="text-white font-bold text-xs">Connection Stable</p>
            <p className="text-slate-400 text-[10px]">WebRTC & AI Engine Syncing</p>
          </div>
        </div>

        {/* Center Control Buttons */}
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleAudio}
            className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all shadow-md ${
              audioEnabled ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-red-500/20 text-red-500 border border-red-500/40'
            }`}
            title="Toggle Microphone"
          >
            {audioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </button>

          <button 
            onClick={toggleVideo}
            className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all shadow-md ${
              videoEnabled ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-red-500/20 text-red-500 border border-red-500/40'
            }`}
            title="Toggle Webcam"
          >
            {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </button>

          <button 
            onClick={toggleScreenShare}
            className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all shadow-md ${
              isScreenSharing ? 'bg-brand-600 text-white shadow-brand-600/30' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="Share Screen"
          >
            <Share2 className="h-5 w-5" />
          </button>

          <button 
            onClick={() => setHandRaised(!handRaised)}
            className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all shadow-md ${
              handRaised ? 'bg-amber-500 text-slate-950 font-bold shadow-amber-500/30 animate-bounce' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="Raise Hand"
          >
            <Hand className="h-5 w-5" />
          </button>

          <div className="w-px h-8 bg-slate-800 mx-2"></div>

          {isHostOrAdmin ? (
            <button 
              onClick={() => handleHostAction('end_meeting')}
              className="h-12 px-6 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-red-600/30 transition-all flex items-center gap-2"
            >
              <PhoneOff className="h-4 w-4" /> End Class
            </button>
          ) : (
            <button 
              onClick={onClose}
              className="h-12 px-6 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-red-600/30 transition-all flex items-center gap-2"
            >
              <PhoneOff className="h-4 w-4" /> Leave Class
            </button>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 w-64">
          <button 
            onClick={() => setActiveTab(activeTab === 'video' ? 'chat' : 'video')}
            className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-bold hover:text-white transition-colors flex items-center gap-2"
          >
            <Users className="h-4 w-4 text-brand-400" />
            <span>Side Panel</span>
          </button>
        </div>
      </footer>

    </div>
  );
}
