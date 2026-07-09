from langchain_groq import ChatGroq
from ..config import settings

# gemma2-9b-it and llama-3.3-70b-versatile are deprecated on Groq (as of June 2026).
# Using current recommended replacements.
primary_llm = ChatGroq(
    model="openai/gpt-oss-20b",
    api_key=settings.GROQ_API_KEY,
    temperature=0.2,
)

context_llm = ChatGroq(
    model="openai/gpt-oss-120b",
    api_key=settings.GROQ_API_KEY,
    temperature=0.5,
)
