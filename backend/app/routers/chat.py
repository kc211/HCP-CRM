import json
from fastapi import APIRouter
from langchain_core.messages import HumanMessage, AIMessage, ToolMessage
from ..schemas import ChatRequest, ChatResponse
from ..agent.graph import agent_graph

router = APIRouter(prefix="/api", tags=["chat"])

# very simple in-memory per-session history (fine for an assignment submission)
_SESSIONS: dict[str, list] = {}


@router.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    history = _SESSIONS.setdefault(req.session_id, [])
    history.append(HumanMessage(content=req.message))

    result = agent_graph.invoke({"messages": history})
    messages = result["messages"]
    _SESSIONS[req.session_id] = messages

    form_data = None
    suggestions = None
    for m in messages:
        if isinstance(m, ToolMessage):
            try:
                payload = json.loads(m.content)
            except (json.JSONDecodeError, TypeError):
                continue
            if payload.get("type") == "form_data":
                form_data = payload["data"]
            elif payload.get("type") == "suggestions":
                suggestions = payload["data"]

    reply = ""
    for m in reversed(messages):
        if isinstance(m, AIMessage) and m.content:
            reply = m.content
            break

    return ChatResponse(reply=reply or "Got it — updating the form now.", form_data=form_data, suggestions=suggestions)
