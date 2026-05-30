"""
RAG engine using ChromaDB + sentence-transformers.
Upgraded from module-06/lesson-02 bag-of-words to production embeddings.
"""

import chromadb
from chromadb.config import Settings
import os
import re
import uuid
from .embeddings import embed_texts, embed_single

# ChromaDB persistent storage
CHROMA_PATH = os.path.join(os.path.dirname(__file__), "..", "chroma_data")

_client: chromadb.ClientAPI | None = None


def get_chroma_client() -> chromadb.ClientAPI:
    global _client
    if _client is None:
        _client = chromadb.PersistentClient(path=os.path.abspath(CHROMA_PATH))
        print(f"[rag] ChromaDB initialized at {CHROMA_PATH}")
    return _client


def get_collection(chatbot_id: str) -> chromadb.Collection:
    """Get or create a ChromaDB collection for a chatbot."""
    client = get_chroma_client()
    return client.get_or_create_collection(
        name=f"chatbot_{chatbot_id}",
        metadata={"hnsw:space": "cosine"},
    )


def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> list[str]:
    """
    Split text into overlapping chunks.
    chunk_size: max characters per chunk
    overlap: characters of overlap between chunks
    """
    # Clean whitespace
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) <= chunk_size:
        return [text]

    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        # Try to break at sentence boundary
        if end < len(text):
            last_period = text.rfind(".", start, end)
            last_newline = text.rfind("\n", start, end)
            break_at = max(last_period, last_newline)
            if break_at > start + chunk_size // 2:
                end = break_at + 1
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        start = end - overlap
    return chunks


def add_document(chatbot_id: str, doc_id: str, filename: str, content: str) -> int:
    """
    Chunk a document, embed it, and store in ChromaDB.
    Returns the number of chunks created.
    """
    chunks = chunk_text(content)
    if not chunks:
        return 0

    collection = get_collection(chatbot_id)
    embeddings = embed_texts(chunks)

    ids = [f"{doc_id}_chunk_{i}" for i in range(len(chunks))]
    metadatas = [{"doc_id": doc_id, "filename": filename, "chunk_index": i} for i in range(len(chunks))]

    collection.add(
        ids=ids,
        embeddings=embeddings,
        documents=chunks,
        metadatas=metadatas,
    )
    return len(chunks)


def remove_document(chatbot_id: str, doc_id: str):
    """Remove all chunks for a document from ChromaDB."""
    collection = get_collection(chatbot_id)
    # Get all chunk IDs for this document
    results = collection.get(where={"doc_id": doc_id})
    if results["ids"]:
        collection.delete(ids=results["ids"])


def retrieve(chatbot_id: str, query: str, top_k: int = 5) -> list[dict]:
    """
    Find the most relevant chunks for a query.
    Returns list of {content, filename, similarity} dicts.
    """
    collection = get_collection(chatbot_id)
    if collection.count() == 0:
        return []

    query_embedding = embed_single(query)

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=min(top_k, collection.count()),
    )

    retrieved = []
    for i in range(len(results["documents"][0])):
        retrieved.append({
            "content": results["documents"][0][i],
            "filename": results["metadatas"][0][i].get("filename", "unknown"),
            "distance": results["distances"][0][i] if results.get("distances") else 0,
        })
    return retrieved


def delete_collection(chatbot_id: str):
    """Delete entire collection for a chatbot."""
    client = get_chroma_client()
    try:
        client.delete_collection(f"chatbot_{chatbot_id}")
    except Exception:
        pass
