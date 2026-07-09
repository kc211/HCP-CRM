from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine
from .routers import chat, interactions

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI-First CRM - HCP Interaction Module")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)
app.include_router(interactions.router)


@app.get("/")
def root():
    return {"status": "ok", "service": "hcp-crm-backend"}
