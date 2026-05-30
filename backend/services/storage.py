"""
Firebase Storage + Firestore service.
Handles document uploads and database operations.
"""

import firebase_admin
from firebase_admin import credentials, firestore, storage, auth
import os
import json

_app = None
_db = None
_bucket = None


def init_firebase():
    """Initialize Firebase Admin SDK."""
    global _app, _db, _bucket
    if _app is not None:
        return

    cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "./firebase-credentials.json")
    if os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        _app = firebase_admin.initialize_app(cred, {
            "storageBucket": f"{json.load(open(cred_path))['project_id']}.firebasestorage.app",
        })
    else:
        # Use default credentials (for Cloud Run)
        _app = firebase_admin.initialize_app(options={
            "storageBucket": "respond-iq.firebasestorage.app",
        })

    _db = firestore.client()
    _bucket = storage.bucket()
    print("[storage] Firebase initialized")


def get_db():
    if _db is None:
        init_firebase()
    return _db


def get_bucket():
    if _bucket is None:
        init_firebase()
    return _bucket


def verify_token(id_token: str) -> dict:
    """Verify Firebase ID token and return user info."""
    if _app is None:
        init_firebase()
    return auth.verify_id_token(id_token)


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text from PDF bytes."""
    from PyPDF2 import PdfReader
    import io
    reader = PdfReader(io.BytesIO(file_bytes))
    text = ""
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\n"
    return text


def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extract text from DOCX bytes."""
    from docx import Document
    import io
    doc = Document(io.BytesIO(file_bytes))
    return "\n".join(p.text for p in doc.paragraphs if p.text.strip())


def extract_text(filename: str, file_bytes: bytes) -> str:
    """Extract text from various file formats."""
    ext = filename.lower().rsplit(".", 1)[-1] if "." in filename else ""
    if ext == "pdf":
        return extract_text_from_pdf(file_bytes)
    elif ext == "docx":
        return extract_text_from_docx(file_bytes)
    elif ext in ("txt", "md", "csv", "json"):
        return file_bytes.decode("utf-8", errors="ignore")
    else:
        return file_bytes.decode("utf-8", errors="ignore")
