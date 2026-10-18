from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.repositories.profile import ProfileRepository
from app.schemas.profile import ProfileCreate, ProfileUpdate, ProfileResponse
from app.models.profile import StudentProfile


class ProfileService:
    def __init__(self, db: Session):
        self.repo = ProfileRepository(db)

    def create_profile(self, profile_in: ProfileCreate, access_key_hash: Optional[str] = None) -> StudentProfile:
        existing = self.repo.get_by_email(profile_in.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"A profile with email {profile_in.email} already exists."
            )
        return self.repo.create(profile_in, access_key_hash=access_key_hash)

    def get_profile(self, profile_id: int) -> StudentProfile:
        profile = self.repo.get_by_id(profile_id)
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Student profile with id {profile_id} not found."
            )
        return profile

    def update_profile(self, profile_id: int, profile_in: ProfileUpdate) -> StudentProfile:
        profile = self.get_profile(profile_id)
        if profile_in.email and profile_in.email != profile.email:
            existing = self.repo.get_by_email(profile_in.email)
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"A profile with email {profile_in.email} already exists."
                )
        return self.repo.update(profile, profile_in)

    def list_profiles(
        self,
        skip: int = 0,
        limit: int = 50,
        state: Optional[str] = None,
        education_level: Optional[str] = None,
        is_at_risk: Optional[bool] = None
    ) -> List[StudentProfile]:
        return self.repo.get_all(skip=skip, limit=limit, state=state, education_level=education_level, is_at_risk=is_at_risk)

    def delete_profile(self, profile_id: int) -> None:
        success = self.repo.delete(profile_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Student profile with id {profile_id} not found."
            )
