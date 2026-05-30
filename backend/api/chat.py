"""
Chat API — Streaming SSE endpoint for the embeddable widget.
Public endpoint (uses API key, not Firebase auth).
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from models.schemas import ChatMessage
from services.storage import get_db
from services.rag import retrieve
from services.llm import stream_response
from datetime import datetime
import json
import uuid

router = APIRouter(prefix="/api/chat", tags=["chat"])


def _get_chatbot_by_api_key(api_key: str) -> tuple[str, dict]:
    """Look up chatbot by its public API key."""
    db = get_db()
    docs = db.collection("chatbots").where("apiKey", "==", api_key).limit(1).stream()
    for doc in docs:
        return doc.id, doc.to_dict()
    raise HTTPException(404, "Invalid API key")


@router.get("/{api_key}/config")
async def get_widget_config(api_key: str):
    """Get widget configuration (colors, welcome message, etc). Public endpoint."""
    chatbot_id, chatbot = _get_chatbot_by_api_key(api_key)
    theme = chatbot.get("theme", {})
    return {
        "name": chatbot.get("name", "Assistant"),
        "theme": theme,
    }


@router.post("/{api_key}")
async def chat(api_key: str, body: ChatMessage):
    """
    Send a message and get a streaming SSE response.
    Public endpoint — the widget uses this.
    """
    chatbot_id, chatbot = _get_chatbot_by_api_key(api_key)
    db = get_db()

    # Check usage limits
    user_id = chatbot["userId"]
    user_doc = db.collection("users").document(user_id).get()
    plan = user_doc.to_dict().get("plan", "free") if user_doc.exists else "free"
    from models.schemas import PLAN_LIMITS
    limits = PLAN_LIMITS[plan]
    month_key = datetime.utcnow().strftime("%Y-%m")
    usage_ref = db.collection("usage").document(user_id).collection(month_key).document("stats")
    usage_doc = usage_ref.get()
    current_messages = usage_doc.to_dict().get("messageCount", 0) if usage_doc.exists else 0
    if limits["messages_per_month"] != -1 and current_messages >= limits["messages_per_month"]:
        raise HTTPException(429, "Monthly message limit reached. Owner needs to upgrade plan.")

    # Retrieve relevant context from RAG
    retrieved = retrieve(chatbot_id, body.message, top_k=5)
    context = "\n\n".join(
        f"[Source: {r['filename']}]\n{r['content']}"
        for r in retrieved
    )

    # Get conversation history
    conv_id = body.conversation_id or str(uuid.uuid4())
    visitor_id = body.visitor_id or "anonymous"
    conv_ref = db.collection("chatbots").document(chatbot_id).collection("conversations").document(conv_id)
    conv_doc = conv_ref.get()
    history = []
    if conv_doc.exists:
        history = conv_doc.to_dict().get("messages", [])

    # Stream response
    async def event_stream():
        full_response = ""
        # Send conversation ID first
        yield f"data: {json.dumps({'type': 'meta', 'conversation_id': conv_id})}\n\n"

        try:
            async for token in stream_response(
                model_key=chatbot.get("model", "claude-haiku"),
                system_prompt=chatbot.get("systemPrompt", "You are a helpful assistant."),
                context=context,
                messages=history,
                user_message=body.message,
            ):
                full_response += token
                yield f"data: {json.dumps({'type': 'token', 'content': token})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"

        # Save conversation to Firestore
        now = datetime.utcnow().isoformat()
        history.append({"role": "user", "content": body.message, "timestamp": now})
        history.append({"role": "assistant", "content": full_response, "timestamp": now})

        # Include sources in the last message
        sources = [r["filename"] for r in retrieved] if retrieved else []

        conv_data = {
            "visitorId": visitor_id,
            "messages": history,
            "sources": sources,
            "startedAt": conv_doc.to_dict().get("startedAt", now) if conv_doc.exists else now,
            "lastMessageAt": now,
        }
        conv_ref.set(conv_data, merge=True)

        # Update usage counters
        from google.cloud.firestore_v1 import Increment
        usage_ref.set({"messageCount": Increment(1), "conversationCount": Increment(1 if not conv_doc.exists else 0)}, merge=True)
        db.collection("chatbots").document(chatbot_id).update({
            "messageCount": Increment(1),
            "conversationCount": Increment(1 if not conv_doc.exists else 0),
        })

        yield f"data: {json.dumps({'type': 'done', 'sources': sources})}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")
