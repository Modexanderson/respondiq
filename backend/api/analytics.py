"""
Analytics API — Usage stats and conversation history.
"""

from fastapi import APIRouter, Header, HTTPException
from services.storage import get_db
from api.auth import get_current_user
from datetime import datetime

router = APIRouter(prefix="/api/chatbots/{chatbot_id}", tags=["analytics"])


async def _verify_ownership(chatbot_id: str, authorization: str) -> dict:
    user = await get_current_user(authorization)
    db = get_db()
    doc = db.collection("chatbots").document(chatbot_id).get()
    if not doc.exists:
        raise HTTPException(404, "Chatbot not found")
    if doc.to_dict()["userId"] != user["uid"]:
        raise HTTPException(403, "Not your chatbot")
    return user


@router.get("/analytics")
async def get_analytics(chatbot_id: str, authorization: str = Header(...)):
    """Get usage statistics for a chatbot."""
    user = await _verify_ownership(chatbot_id, authorization)
    db = get_db()

    chatbot = db.collection("chatbots").document(chatbot_id).get().to_dict()

    # Get conversation count and messages
    conversations = list(
        db.collection("chatbots").document(chatbot_id).collection("conversations").stream()
    )

    total_messages = 0
    questions = []
    satisfaction = {"positive": 0, "negative": 0}
    today = datetime.utcnow().strftime("%Y-%m-%d")
    messages_today = 0

    for conv in conversations:
        data = conv.to_dict()
        msgs = data.get("messages", [])
        total_messages += len([m for m in msgs if m.get("role") == "user"])

        # Count today's messages
        for msg in msgs:
            if msg.get("role") == "user" and msg.get("timestamp", "").startswith(today):
                messages_today += 1

        # Collect questions
        for msg in msgs:
            if msg.get("role") == "user":
                questions.append(msg.get("content", ""))

        # Count satisfaction
        sat = data.get("satisfaction")
        if sat in satisfaction:
            satisfaction[sat] += 1

    # Find popular questions (simple frequency)
    from collections import Counter
    popular = Counter(questions).most_common(10)

    return {
        "totalMessages": total_messages,
        "totalConversations": len(conversations),
        "messagesToday": messages_today,
        "popularQuestions": [{"question": q, "count": c} for q, c in popular],
        "satisfaction": satisfaction,
    }


@router.get("/conversations")
async def get_conversations(chatbot_id: str, authorization: str = Header(...)):
    """Get all conversations for a chatbot."""
    await _verify_ownership(chatbot_id, authorization)
    db = get_db()

    conversations = []
    for doc in db.collection("chatbots").document(chatbot_id).collection("conversations").stream():
        data = doc.to_dict()
        data["id"] = doc.id
        conversations.append(data)

    conversations.sort(key=lambda x: x.get("lastMessageAt", ""), reverse=True)
    return conversations
