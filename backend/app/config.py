from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    GROQ_API_KEY: str = "" #Hi team, I removed this becasue of security reasons, paste your groq key here 
    DATABASE_URL: str = "" #and set your name db , when the backend runs it automatically creates the db but we need a hcp_crm database created 

    class Config:
        env_file = ".env"

settings = Settings()
