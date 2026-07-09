import json
from datetime import datetime
from typing import Dict, Any

from langchain_core.tools import tool
from ..database import SessionLocal
from ..models import HCP, Interaction
from .llm import context_llm


def _interaction_to_form(i: Interaction) -> dict:
    return {
        "id": i.id,
        "hcp_name": i.hcp_name,
        "interaction_type": i.interaction_type,
        "date": i.date,
        "time": i.time,
        "attendees": i.attendees,
        "topics_discussed": i.topics_discussed,
        "materials_shared": i.materials_shared,
        "samples_distributed": i.samples_distributed,
        "sentiment": i.sentiment,
        "outcomes": i.outcomes,
        "follow_up_actions": i.follow_up_actions,
    }


@tool
def log_interaction(
    hcp_name: str,
    interaction_type: str = "Meeting",
    date: str = "",
    time: str = "",
    attendees: str = "",
    topics_discussed: str = "",
    materials_shared: str = "",
    samples_distributed: str = "",
    sentiment: str = "Neutral",
    outcomes: str = "",
    follow_up_actions: str = "",
) -> str:
    """
    Log a NEW HCP interaction.

    Use this whenever the user describes a meeting/call/visit that has not
    already been logged.

    If the HCP does not exist, automatically create the HCP first.
    """

    db = SessionLocal()

    try:
        if not date:
            date = datetime.now().strftime("%d-%m-%Y")

        if not time:
            time = datetime.now().strftime("%H:%M")

        hcp = (
            db.query(HCP)
            .filter(HCP.name.ilike(hcp_name))
            .first()
        )

        if not hcp:
            hcp = HCP(name=hcp_name)
            db.add(hcp)
            db.commit()
            db.refresh(hcp)

        interaction = Interaction(
            hcp_id=hcp.id,
            hcp_name=hcp_name,
            interaction_type=interaction_type,
            date=date,
            time=time,
            attendees=attendees,
            topics_discussed=topics_discussed,
            materials_shared=materials_shared,
            samples_distributed=samples_distributed,
            sentiment=sentiment,
            outcomes=outcomes,
            follow_up_actions=follow_up_actions,
        )

        db.add(interaction)
        db.commit()
        db.refresh(interaction)

        return json.dumps(
            {
                "type": "form_data",
                "action": "log",
                "data": _interaction_to_form(interaction),
            }
        )

    finally:
        db.close()


@tool
def edit_interaction(
    interaction_id: int,
    updates: Dict[str, Any],
) -> str:
    """
    Edit an EXISTING interaction.

    IMPORTANT:
    - interaction_id MUST be an integer.
    - updates MUST be a JSON object/dictionary.
    - Do NOT call this tool unless the interaction already exists.

    Example:

    interaction_id = 1

    updates = {
        "sentiment": "Positive",
        "outcomes": "Agreed to trial"
    }
    """
    interaction_id = int(interaction_id)

    db = SessionLocal()

    try:
        interaction = (
            db.query(Interaction)
            .filter(Interaction.id == interaction_id)
            .first()
        )

        if not interaction:
            return json.dumps(
                {
                    "type": "error",
                    "message": f"No interaction found with id {interaction_id}",
                }
            )

        for key, value in updates.items():
            if hasattr(interaction, key):
                setattr(interaction, key, value)

        db.commit()
        db.refresh(interaction)

        return json.dumps(
            {
                "type": "form_data",
                "action": "edit",
                "data": _interaction_to_form(interaction),
            }
        )

    finally:
        db.close()


@tool
def search_hcp(query: str) -> str:
    """
    Search registered HCPs by partial name.

    Use this before logging if the HCP name is uncertain.
    """

    db = SessionLocal()

    try:
        results = (
            db.query(HCP)
            .filter(HCP.name.ilike(f"%{query}%"))
            .limit(5)
            .all()
        )

        data = [
            {
                "id": h.id,
                "name": h.name,
                "specialty": h.specialty,
            }
            for h in results
        ]

        return json.dumps(
            {
                "type": "hcp_matches",
                "data": data,
            }
        )

    finally:
        db.close()


@tool
def get_interaction_history(hcp_name: str) -> str:
    """
    Return the last 5 interactions for an HCP.

    Use this BEFORE calling edit_interaction so the model knows the
    interaction_id.
    """

    db = SessionLocal()

    try:
        results = (
            db.query(Interaction)
            .filter(Interaction.hcp_name.ilike(hcp_name))
            .order_by(Interaction.created_at.desc())
            .limit(5)
            .all()
        )

        data = [_interaction_to_form(i) for i in results]

        return json.dumps(
            {
                "type": "history",
                "data": data,
            }
        )

    finally:
        db.close()


@tool
def suggest_followup(interaction_summary: str) -> str:
    """
    Generate 2-4 follow-up actions after an interaction. Call this right after
    log_interaction succeeds.
    """

    prompt = f"""
You are a pharma sales assistant.

Given the following interaction summary, generate 2-4 follow-up actions.

Return ONLY a JSON array of objects, no other text, each shaped exactly like:
{{"action": "short action, max 10 words", "reason": "why, max 15 words", "due_date": "e.g. in 2 weeks / YYYY-MM-DD"}}

Summary:
{interaction_summary}
"""

    response = context_llm.invoke(prompt)

    raw = (
        response.content
        .replace("```json", "")
        .replace("```", "")
        .strip()
    )

    def _fallback():
        lines = [line.strip("-• ") for line in raw.split("\n") if line.strip()][:4]
        return [{"action": line, "reason": "", "due_date": ""} for line in lines]

    try:
        parsed = json.loads(raw)
        if not isinstance(parsed, list):
            parsed = [parsed]

        suggestions = []
        for item in parsed:
            if isinstance(item, dict):
                suggestions.append({
                    "action": item.get("action", str(item)),
                    "reason": item.get("reason", ""),
                    "due_date": item.get("due_date", ""),
                })
            else:
                suggestions.append({"action": str(item), "reason": "", "due_date": ""})

        if not suggestions:
            suggestions = _fallback()

    except Exception:
        suggestions = _fallback()

    return json.dumps(
        {
            "type": "suggestions",
            "data": suggestions,
        }
    )