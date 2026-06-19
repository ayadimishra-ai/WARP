from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, UUID4

from app.guards.auth import get_current_user

router = APIRouter(prefix="/user", tags=["platform-user"])


class UserCreate(BaseModel):
    email: EmailStr
    name: str
    company_id: UUID4
    role: str


class UserUpdate(BaseModel):
    name: str | None = None
    role: str | None = None


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_user(body: UserCreate, user: dict = Depends(get_current_user)) -> dict:
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not yet implemented")


@router.get("/{user_id}")
async def get_user(user_id: UUID4, user: dict = Depends(get_current_user)) -> dict:
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not yet implemented")


@router.patch("/{user_id}")
async def update_user(user_id: UUID4, body: UserUpdate, user: dict = Depends(get_current_user)) -> dict:
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not yet implemented")
