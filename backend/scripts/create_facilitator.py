"""Create (or reset the password of) a facilitator account.

Usage, from the repository root with the backend environment configured
(DATABASE_URL etc.):

    python backend/scripts/create_facilitator.py counselor@example.org "Full Name"

The password is read from a hidden prompt, never from the command line.
Use --deactivate to switch an account off.
"""
from __future__ import annotations

import argparse
import getpass
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "backend"))

from app.core.database import Base, SessionLocal, engine  # noqa: E402
from app.core.security import hash_password  # noqa: E402
from app.models.facilitator import FacilitatorAccount  # noqa: E402

MIN_PASSWORD_LENGTH = 12


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("email")
    parser.add_argument("full_name", nargs="?", default=None)
    parser.add_argument("--deactivate", action="store_true", help="disable this account instead")
    args = parser.parse_args()
    email = args.email.strip().lower()

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        account = db.query(FacilitatorAccount).filter(FacilitatorAccount.email == email).first()

        if args.deactivate:
            if not account:
                print("No facilitator with that email.")
                return 1
            account.is_active = False
            db.commit()
            print("Deactivated.")
            return 0

        if not account and not args.full_name:
            print("A full name is required for a new account.")
            return 1

        password = getpass.getpass("New password: ")
        if len(password) < MIN_PASSWORD_LENGTH:
            print(f"Password must be at least {MIN_PASSWORD_LENGTH} characters.")
            return 1
        if getpass.getpass("Repeat password: ") != password:
            print("Passwords do not match.")
            return 1

        if account:
            account.password_hash = hash_password(password)
            account.is_active = True
            if args.full_name:
                account.full_name = args.full_name
            action = "Password reset"
        else:
            db.add(FacilitatorAccount(email=email, full_name=args.full_name, password_hash=hash_password(password)))
            action = "Created"
        db.commit()
        print(f"{action} facilitator account.")
        return 0
    finally:
        db.close()


if __name__ == "__main__":
    sys.exit(main())
