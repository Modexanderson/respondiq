from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# ── Auth ──
class UserProfile(BaseModel):
    uid: str
    email: str
    display_name: Optional[str] = None
    photo_url: Optional[str] = None
    plan: str = "free"
    stripe_customer_id: Optional[str] = None
    created_at: Optional[str] = None


# ── Chatbot ──
class ChatbotTheme(BaseModel):
    primary_color: str = "#1e40af"
    bg_color: str = "#ffffff"
    text_color: str = "#1f2937"
    position: str = "bottom-right"
    welcome_message: str = "Hi! How can I help you today?"
    placeholder: str = "Type your message..."
    avatar: Optional[str] = None
    size: str = "standard"


class ChatbotCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = ""
    system_prompt: str = "You are a helpful assistant. Answer questions based only on the provided context. If you don't know, say so."
    model: str = "claude-haiku"
    theme: ChatbotTheme = ChatbotTheme()


class ChatbotUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    system_prompt: Optional[str] = None
    model: Optional[str] = None
    theme: Optional[ChatbotTheme] = None


class ChatbotResponse(BaseModel):
    id: str
    user_id: str
    name: str
    description: str
    system_prompt: str
    model: str
    theme: ChatbotTheme
    api_key: str
    message_count: int = 0
    conversation_count: int = 0
    created_at: str
    updated_at: str


# ── Documents ──
class DocumentResponse(BaseModel):
    id: str
    filename: str
    mime_type: str
    size_bytes: int
    chunks: int
    uploaded_at: str


class ScrapeRequest(BaseModel):
    url: str
    max_pages: int = 5


class ManualTextInput(BaseModel):
    title: str
    content: str


# ── Chat ──
class ChatMessage(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    visitor_id: Optional[str] = None


# ── Analytics ──
class AnalyticsResponse(BaseModel):
    total_messages: int = 0
    total_conversations: int = 0
    messages_today: int = 0
    popular_questions: list = []
    satisfaction: dict = {"positive": 0, "negative": 0}


# ── Plan limits ──
PLAN_LIMITS = {
    "free": {"chatbots": 1, "messages_per_month": 50, "documents": 5},
    "pro": {"chatbots": 5, "messages_per_month": 2000, "documents": 50},
    "business": {"chatbots": -1, "messages_per_month": 10000, "documents": 200},
}
