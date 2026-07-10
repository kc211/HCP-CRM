# AI-First CRM — HCP Interaction Module

Log HCP (Healthcare Professional) interactions purely by chatting with an AI
assistant. The user never types into the form directly — a LangGraph agent
extracts structured fields from natural language and fills the form.

## Architecture
- **Frontend**: React + Redux Toolkit + Tailwind CSS. Split screen — read-only
  form (left), chat interface (right).
- **Backend**: FastAPI + LangGraph + LangChain (`langchain-groq`).
- **LLMs (Groq)**: `gemma2-9b-it` and , `llama-3.3-70b-versatile` ( mentioned in doc)
                    `openai/gpt-oss-20b` and `openai/gpt-oss-120b` ( above models are depricated, hence i am using these models)
- **Database**: PostgreSQL (SQLAlchemy ORM), tables: `hcps`, `interactions`.

## LangGraph Agent
A single `create_react_agent` node bound to 5 tools (see `backend/app/agent/tools.py`):

| Tool | Purpose |
| `log_interaction` | **(required)** Extracts fields from chat text via LLM, saves a new interaction, returns form JSON |
| `edit_interaction` | **(required)** Updates fields of an already-logged interaction by id |
| `search_hcp` | Autocompletes/verifies HCP names against the DB |
| `get_interaction_history` | Fetches past interactions for context/editing |
| `suggest_followup` | LLM-generated next-step suggestions after logging |

The chat endpoint (`POST /api/chat`) invokes the graph, scans the resulting
`ToolMessage`s for `form_data` / `suggestions` payloads, and returns them
alongside the agent's natural-language reply. The frontend dispatches
`form_data` into the Redux `interaction` slice, which the form component
renders (all inputs disabled — chat is the only way to fill it).

## Setup

### 1. Database
```bash
createdb hcp_crm   # or via any Postgres client
```

### 2. Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # then add your GROQ_API_KEY and DATABASE_URL
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev   # http://localhost:5173
```

## Example chat inputs to try
- "Met Dr. Sharma today at 3pm, discussed Product X efficacy data, she seemed positive, I shared the new brochure and left 2 samples."
- "Actually change the sentiment on that last one to neutral."
- "What did I discuss with Dr. Sharma last time?"

## Notes
- `langgraph.prebuilt.create_react_agent` signature varies slightly by version —
  if you hit a `TypeError` on `state_modifier`, rename it to `prompt` in
  `backend/app/agent/graph.py` (see comment there).
- Chat history is kept in-memory per `session_id` for simplicity (fine for a
  local assignment submission; swap for Redis/DB-backed history for production).
