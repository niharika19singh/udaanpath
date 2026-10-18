"""Access control for student data (standard library only).

Students: creating a profile returns a random access key once. Only its
SHA-256 is stored. Requests for that student's data must send
``Authorization: Bearer <key>``.

Facilitators: accounts are created by an admin (scripts/create_facilitator.py)
with a scrypt-hashed password. Logging in returns a short-lived token signed
with SECRET_KEY; it grants access to every student's data.

Failures never reveal whether a student id exists to a caller who is not
allowed to see it.
"""
import base64
import hashlib
import hmac
import json
import secrets
import time
from typing import Optional, Tuple

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db

FACILITATOR_TOKEN_PREFIX = "fac."

# --- student access keys ----------------------------------------------------


def new_access_key() -> Tuple[str, str]:
    """Returns (key to give the student once, hash to store)."""
    key = secrets.token_urlsafe(32)
    return key, hash_access_key(key)


def hash_access_key(key: str) -> str:
    return hashlib.sha256(key.encode("utf-8")).hexdigest()


# --- facilitator passwords --------------------------------------------------

_SCRYPT_N, _SCRYPT_R, _SCRYPT_P = 2**14, 8, 1


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.scrypt(password.encode("utf-8"), salt=salt, n=_SCRYPT_N, r=_SCRYPT_R, p=_SCRYPT_P)
    return "scrypt${}${}${}${}${}".format(
        _SCRYPT_N, _SCRYPT_R, _SCRYPT_P, salt.hex(), digest.hex()
    )


def verify_password(password: str, stored: str) -> bool:
    try:
        scheme, n, r, p, salt_hex, digest_hex = stored.split("$")
        if scheme != "scrypt":
            return False
        digest = hashlib.scrypt(
            password.encode("utf-8"), salt=bytes.fromhex(salt_hex), n=int(n), r=int(r), p=int(p)
        )
    except (ValueError, TypeError):
        return False
    return hmac.compare_digest(digest.hex(), digest_hex)


# --- facilitator tokens -----------------------------------------------------


def _b64(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _unb64(text: str) -> bytes:
    return base64.urlsafe_b64decode(text + "=" * (-len(text) % 4))


def _sign(body: str) -> str:
    return _b64(hmac.new(settings.SECRET_KEY.encode("utf-8"), body.encode("ascii"), hashlib.sha256).digest())


def create_facilitator_token(facilitator_id: int) -> Tuple[str, int]:
    """Returns (token, lifetime in seconds)."""
    ttl = settings.FACILITATOR_TOKEN_TTL_MINUTES * 60
    body = _b64(json.dumps({"fid": facilitator_id, "exp": int(time.time()) + ttl}).encode("utf-8"))
    return FACILITATOR_TOKEN_PREFIX + body + "." + _sign(body), ttl


def read_facilitator_token(token: str) -> Optional[int]:
    """Facilitator id for a valid, unexpired token, else None."""
    if not token.startswith(FACILITATOR_TOKEN_PREFIX):
        return None
    try:
        body, signature = token[len(FACILITATOR_TOKEN_PREFIX):].split(".")
        if not hmac.compare_digest(signature, _sign(body)):
            return None
        payload = json.loads(_unb64(body))
        if int(payload["exp"]) < time.time():
            return None
        return int(payload["fid"])
    except (ValueError, KeyError, TypeError):
        return None


# --- request checks ---------------------------------------------------------


def bearer_token(authorization: Optional[str] = Header(None)) -> Optional[str]:
    if not authorization:
        return None
    scheme, _, token = authorization.partition(" ")
    return token.strip() if scheme.lower() == "bearer" and token.strip() else None


def _unauthorized() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Sign-in required.",
        headers={"WWW-Authenticate": "Bearer"},
    )


def _forbidden() -> HTTPException:
    return HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have access to this student.")


def _active_facilitator(db: Session, token: str):
    from app.models.facilitator import FacilitatorAccount

    facilitator_id = read_facilitator_token(token)
    if facilitator_id is None:
        return None
    account = db.get(FacilitatorAccount, facilitator_id)
    return account if account and account.is_active else None


def require_facilitator(token: Optional[str] = Depends(bearer_token), db: Session = Depends(get_db)):
    """Dependency for routes that list or manage many students."""
    if not token:
        raise _unauthorized()
    account = _active_facilitator(db, token)
    if account is None:
        raise _forbidden() if not token.startswith(FACILITATOR_TOKEN_PREFIX) else _unauthorized()
    return account


def authorize_student(db: Session, student_id: Optional[int], token: Optional[str]) -> None:
    """Allows the student holding their key, or any active facilitator."""
    from app.models.profile import StudentProfile

    if not token:
        raise _unauthorized()
    if token.startswith(FACILITATOR_TOKEN_PREFIX):
        if _active_facilitator(db, token) is None:
            raise _unauthorized()
        return
    profile = db.get(StudentProfile, student_id) if student_id is not None else None
    if (
        profile is None
        or not profile.access_key_hash
        or not hmac.compare_digest(profile.access_key_hash, hash_access_key(token))
    ):
        raise _forbidden()
