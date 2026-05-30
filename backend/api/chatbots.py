"""
Chatbot CRUD API — Create, read, update, delete chatbots.
"""

from fastapi import APIRouter, Header, HTTPException, Depends
from models.schemas import ChatbotCreate, ChatbotUpdate, ChatbotResponse, PLAN_LIMITS
from services.storage import get_db
from services.rag import delete_collection
from api.auth import get_current_user
from datetime import datetime
import secrets

router = APIRouter(prefix="/api/chatbots", tags=["chatbots"])


def _require_auth(authorization: str = Header(...)):
    return authorization


@router.get("")
async def list_chatbots(authorization: str = Header(...)):
    """List all chatbots for the authenticated user."""
    user = await get_current_user(authorization)
    db = get_db()
    docs = db.collection("chatbots").where("userId", "==", user["uid"]).stream()
    chatbots = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        chatbots.append(data)
    # Sort by creation date, newest first
    chatbots.sort(key=lambda x: x.get("createdAt", ""), reverse=True)
    return chatbots


@router.post("")
async def create_chatbot(body: ChatbotCreate, authorization: str = Header(...)):
    """Create a new chatbot."""
    user = await get_current_user(authorization)
    db = get_db()

    # Check plan limits
    user_doc = db.collection("users").document(user["uid"]).get()
    plan = user_doc.to_dict().get("plan", "free") if user_doc.exists else "free"
    limits = PLAN_LIMITS[plan]

    if limits["chatbots"] != -1:
        existing = list(db.collection("chatbots").where("userId", "==", user["uid"]).stream())
        if len(existing) >= limits["chatbots"]:
            raise HTTPException(403, f"Plan '{plan}' allows max {limits['chatbots']} chatbot(s). Upgrade to create more.")

    now = datetime.utcnow().isoformat()
    api_key = f"riq_{secrets.token_urlsafe(32)}"

    chatbot_data = {
        "userId": user["uid"],
        "name": body.name,
        "description": body.description or "",
        "systemPrompt": body.system_prompt,
        "model": body.model,
        "theme": body.theme.model_dump(),
        "apiKey": api_key,
        "messageCount": 0,
        "conversationCount": 0,
        "createdAt": now,
        "updatedAt": now,
    }

    doc_ref = db.collection("chatbots").add(chatbot_data)
    chatbot_data["id"] = doc_ref[1].id
    return chatbot_data


@router.get("/{chatbot_id}")
async def get_chatbot(chatbot_id: str, authorization: str = Header(...)):
    """Get a single chatbot's details."""
    user = await get_current_user(authorization)
    db = get_db()
    doc = db.collection("chatbots").document(chatbot_id).get()
    if not doc.exists:
        raise HTTPException(404, "Chatbot not found")
    data = doc.to_dict()
    if data["userId"] != user["uid"]:
        raise HTTPException(403, "Not your chatbot")
    data["id"] = doc.id
    return data


@router.put("/{chatbot_id}")
async def update_chatbot(chatbot_id: str, body: ChatbotUpdate, authorization: str = Header(...)):
    """Update a chatbot."""
    user = await get_current_user(authorization)
    db = get_db()
    doc_ref = db.collection("chatbots").document(chatbot_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(404, "Chatbot not found")
    if doc.to_dict()["userId"] != user["uid"]:
        raise HTTPException(403, "Not your chatbot")

    updates = {}
    if body.name is not None:
        updates["name"] = body.name
    if body.description is not None:
        updates["description"] = body.description
    if body.system_prompt is not None:
        updates["systemPrompt"] = body.system_prompt
    if body.model is not None:
        updates["model"] = body.model
    if body.theme is not None:
        updates["theme"] = body.theme.model_dump()
    updates["updatedAt"] = datetime.utcnow().isoformat()

    doc_ref.update(updates)
    data = doc_ref.get().to_dict()
    data["id"] = chatbot_id
    return data


@router.delete("/{chatbot_id}")
async def delete_chatbot(chatbot_id: str, authorization: str = Header(...)):
    """Delete a chatbot and its data."""
    user = await get_current_user(authorization)
    db = get_db()
    doc_ref = db.collection("chatbots").document(chatbot_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(404, "Chatbot not found")
    if doc.to_dict()["userId"] != user["uid"]:
        raise HTTPException(403, "Not your chatbot")

    # Delete all documents in subcollection
    for sub_doc in doc_ref.collection("documents").stream():
        sub_doc.reference.delete()

    # Delete ChromaDB collection
    delete_collection(chatbot_id)

    # Delete chatbot document
    doc_ref.delete()
    return {"message": "Chatbot deleted"}
