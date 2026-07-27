from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime

class AgentEventMessage(BaseModel):
    event_type: str = Field(..., description="Type of event: absence, drowsiness, screen_integrity, content_moderation")
    source_agent: str = Field(..., description="Identifier of the publishing agent service")
    student_id: Optional[int] = Field(None, description="Database ID of the student under monitoring")
    live_class_id: Optional[int] = Field(None, description="Database ID of the live class session")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Model classification confidence score (0.0 to 1.0)")
    details: Dict[str, Any] = Field(default_factory=dict, description="Metadata payload related to the agent signal")
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class OrchestratorDecisionMessage(BaseModel):
    agent_event_id: int = Field(..., description="Reference ID of the originating AgentEvent row in DB")
    action_taken: str = Field(..., description="Decision verdict: none, alert, absent, block, review")
    status: str = Field(..., description="Action execution status: pending_review, applied, overridden")
    details: Dict[str, Any] = Field(default_factory=dict, description="Additional resolution metadata")
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
