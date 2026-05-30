"""
Widget API — Public endpoints for the embeddable chat widget.
No authentication required (uses chatbot API key).
"""

from fastapi import APIRouter, HTTPException
from services.storage import get_db

router = APIRouter(prefix="/api/widget", tags=["widget"])


@router.get("/{api_key}/config")
async def widget_config(api_key: str):
    """
    Get widget configuration for embedding.
    Returns theme, name, and welcome message.
    """
    db = get_db()
    docs = db.collection("chatbots").where("apiKey", "==", api_key).limit(1).stream()
    for doc in docs:
        data = doc.to_dict()
        return {
            "name": data.get("name", "Assistant"),
            "theme": data.get("theme", {}),
            "model": data.get("model", "claude-haiku"),
        }
    raise HTTPException(404, "Invalid API key")
