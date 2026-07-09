from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class ChatRequest(BaseModel):
    message: str
    session_id: str = "default"

class ChatResponse(BaseModel):
    reply: str
    form_data: Optional[Dict[str, Any]] = None
    suggestions: Optional[List[Dict[str, Any]]] = None

class InteractionOut(BaseModel):
    id: int
    hcp_name: str
    interaction_type: str
    date: str
    time: str
    attendees: str
    topics_discussed: str
    materials_shared: str
    samples_distributed: str
    sentiment: str
    outcomes: str
    follow_up_actions: str

    class Config:
        from_attributes = True
