"""
Embedding service using sentence-transformers.
Auto-detects GPU (local) or falls back to CPU (Cloud Run).
"""

from sentence_transformers import SentenceTransformer
import torch

# all-MiniLM-L6-v2: fast, good quality, 384-dim vectors
_model: SentenceTransformer | None = None


def get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        device = "cuda" if torch.cuda.is_available() else "cpu"
        _model = SentenceTransformer("all-MiniLM-L6-v2", device=device)
        print(f"[embeddings] Model loaded on {device}")
    return _model


def embed_texts(texts: list[str]) -> list[list[float]]:
    """Embed a list of texts into vectors."""
    model = get_model()
    embeddings = model.encode(texts, show_progress_bar=False, normalize_embeddings=True)
    return embeddings.tolist()


def embed_single(text: str) -> list[float]:
    """Embed a single text."""
    return embed_texts([text])[0]
