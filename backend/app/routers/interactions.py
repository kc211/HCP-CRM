from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc
from ..database import get_db
from ..models import Interaction
from ..schemas import InteractionOut
from typing import List

router = APIRouter(prefix="/api", tags=["interactions"])


@router.get("/interactions", response_model=List[InteractionOut])
def list_interactions(db: Session = Depends(get_db)):
    return db.query(Interaction).order_by(desc(Interaction.created_at)).all()


@router.get("/interactions/{interaction_id}", response_model=InteractionOut)
def get_interaction(interaction_id: int, db: Session = Depends(get_db)):
    return db.query(Interaction).filter(Interaction.id == interaction_id).first()
