"""
Respondiq Backend — FastAPI Application
========================================
AI Chatbot Builder SaaS API.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(
    title="Respondiq API",
    description="AI Chatbot Builder SaaS",
    version="1.0.0",
)

# CORS
origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and register routers
from api.auth import router as auth_router
from api.chatbots import router as chatbots_router
from api.documents import router as documents_router
from api.chat import router as chat_router
from api.widget import router as widget_router
from api.analytics import router as analytics_router

app.include_router(auth_router)
app.include_router(chatbots_router)
app.include_router(documents_router)
app.include_router(chat_router)
app.include_router(widget_router)
app.include_router(analytics_router)


@app.on_event("startup")
async def startup():
    """Initialize Firebase on startup."""
    from services.storage import init_firebase
    init_firebase()
    print("\n  Respondiq API ready!")
    print("  Docs: http://localhost:8001/docs\n")


@app.get("/")
async def root():
    return {"name": "Respondiq API", "version": "1.0.0", "status": "running"}


@app.get("/health")
async def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
