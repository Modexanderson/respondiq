"""
Document management API — Upload, list, delete knowledge base documents.
"""

from fastapi import APIRouter, Header, HTTPException, UploadFile, File
from models.schemas import ManualTextInput, ScrapeRequest, PLAN_LIMITS
from services.storage import get_db, extract_text
from services.rag import add_document, remove_document
from api.auth import get_current_user
from datetime import datetime
import uuid
import httpx
import re

router = APIRouter(prefix="/api/chatbots/{chatbot_id}/documents", tags=["documents"])

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


async def _verify_ownership(chatbot_id: str, authorization: str) -> dict:
    """Verify user owns the chatbot."""
    user = await get_current_user(authorization)
    db = get_db()
    doc = db.collection("chatbots").document(chatbot_id).get()
    if not doc.exists:
        raise HTTPException(404, "Chatbot not found")
    if doc.to_dict()["userId"] != user["uid"]:
        raise HTTPException(403, "Not your chatbot")
    return user


@router.get("")
async def list_documents(chatbot_id: str, authorization: str = Header(...)):
    """List all documents for a chatbot."""
    await _verify_ownership(chatbot_id, authorization)
    db = get_db()
    docs = db.collection("chatbots").document(chatbot_id).collection("documents").stream()
    result = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        result.append(data)
    result.sort(key=lambda x: x.get("uploadedAt", ""), reverse=True)
    return result


@router.post("")
async def upload_document(
    chatbot_id: str,
    file: UploadFile = File(...),
    authorization: str = Header(...),
):
    """Upload a document (PDF, TXT, DOCX, CSV) to the knowledge base."""
    user = await _verify_ownership(chatbot_id, authorization)
    db = get_db()

    # Check plan limits
    user_doc = db.collection("users").document(user["uid"]).get()
    plan = user_doc.to_dict().get("plan", "free") if user_doc.exists else "free"
    limits = PLAN_LIMITS[plan]
    existing_docs = list(
        db.collection("chatbots").document(chatbot_id).collection("documents").stream()
    )
    if len(existing_docs) >= limits["documents"]:
        raise HTTPException(403, f"Plan '{plan}' allows max {limits['documents']} documents. Upgrade for more.")

    # Read file
    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(400, "File too large. Max 10 MB.")

    # Extract text
    content = extract_text(file.filename, file_bytes)
    if not content.strip():
        raise HTTPException(400, "Could not extract text from file.")

    # Store in RAG
    doc_id = str(uuid.uuid4())
    num_chunks = add_document(chatbot_id, doc_id, file.filename, content)

    # Save metadata to Firestore
    doc_data = {
        "filename": file.filename,
        "mimeType": file.content_type or "application/octet-stream",
        "sizeBytes": len(file_bytes),
        "chunks": num_chunks,
        "uploadedAt": datetime.utcnow().isoformat(),
    }
    db.collection("chatbots").document(chatbot_id).collection("documents").document(doc_id).set(doc_data)

    doc_data["id"] = doc_id
    return doc_data


@router.post("/text")
async def add_text(chatbot_id: str, body: ManualTextInput, authorization: str = Header(...)):
    """Add manual text content to the knowledge base."""
    await _verify_ownership(chatbot_id, authorization)
    db = get_db()

    doc_id = str(uuid.uuid4())
    num_chunks = add_document(chatbot_id, doc_id, body.title, body.content)

    doc_data = {
        "filename": body.title,
        "mimeType": "text/plain",
        "sizeBytes": len(body.content.encode()),
        "chunks": num_chunks,
        "uploadedAt": datetime.utcnow().isoformat(),
    }
    db.collection("chatbots").document(chatbot_id).collection("documents").document(doc_id).set(doc_data)
    doc_data["id"] = doc_id
    return doc_data


@router.delete("/{doc_id}")
async def delete_document(chatbot_id: str, doc_id: str, authorization: str = Header(...)):
    """Remove a document from the knowledge base."""
    await _verify_ownership(chatbot_id, authorization)
    db = get_db()

    doc_ref = db.collection("chatbots").document(chatbot_id).collection("documents").document(doc_id)
    if not doc_ref.get().exists:
        raise HTTPException(404, "Document not found")

    # Remove from ChromaDB
    remove_document(chatbot_id, doc_id)

    # Remove from Firestore
    doc_ref.delete()
    return {"message": "Document deleted"}


@router.post("/scrape", tags=["documents"])
async def scrape_url(chatbot_id: str, body: ScrapeRequest, authorization: str = Header(...)):
    """Scrape a URL and add its text content to the knowledge base."""
    await _verify_ownership(chatbot_id, authorization)
    db = get_db()

    try:
        async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
            resp = await client.get(body.url)
            resp.raise_for_status()
    except Exception as e:
        raise HTTPException(400, f"Failed to fetch URL: {e}")

    # Basic HTML to text extraction
    html = resp.text
    # Remove script/style tags
    html = re.sub(r"<(script|style)[^>]*>.*?</\1>", "", html, flags=re.DOTALL | re.IGNORECASE)
    # Remove HTML tags
    text = re.sub(r"<[^>]+>", " ", html)
    # Clean whitespace
    text = re.sub(r"\s+", " ", text).strip()

    if not text:
        raise HTTPException(400, "No text content found at URL")

    doc_id = str(uuid.uuid4())
    num_chunks = add_document(chatbot_id, doc_id, body.url, text)

    doc_data = {
        "filename": body.url,
        "mimeType": "text/html",
        "sizeBytes": len(text.encode()),
        "chunks": num_chunks,
        "uploadedAt": datetime.utcnow().isoformat(),
    }
    db.collection("chatbots").document(chatbot_id).collection("documents").document(doc_id).set(doc_data)
    doc_data["id"] = doc_id
    return doc_data
