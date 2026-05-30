"""
Auth API — Firebase token verification + user profile management.
"""

from fastapi import APIRouter, Header, HTTPException
from services.storage import verify_token, get_db

router = APIRouter(prefix="/api/auth", tags=["auth"])


async def get_current_user(authorization: str = Header(...)) -> dict:
    """Extract and verify Firebase token from Authorization header."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(401, "Invalid authorization header")
    token = authorization.replace("Bearer ", "")
    try:
        user = verify_token(token)
        return user
    except Exception as e:
        raise HTTPException(401, f"Invalid token: {e}")


@router.post("/verify")
async def verify(authorization: str = Header(...)):
    """Verify Firebase token and ensure user profile exists in Firestore."""
    user = await get_current_user(authorization)
    db = get_db()
    user_ref = db.collection("users").document(user["uid"])
    user_doc = user_ref.get()

    if not user_doc.exists:
        # Create user profile on first login
        from datetime import datetime
        user_ref.set({
            "email": user.get("email", ""),
            "displayName": user.get("name", ""),
            "photoURL": user.get("picture", ""),
            "plan": "free",
            "stripeCustomerId": None,
            "createdAt": datetime.utcnow().isoformat(),
        })

    profile = user_ref.get().to_dict()
    return {"uid": user["uid"], **profile}
