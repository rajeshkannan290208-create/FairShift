import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./fairshift.db")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")
PORT = int(os.getenv("PORT", "8080"))
HOST = os.getenv("HOST", "0.0.0.0")
APP_ENV = os.getenv("APP_ENV", "development")
