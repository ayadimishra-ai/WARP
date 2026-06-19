from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, verify_password
from app.db.session import get_db

router = APIRouter(prefix="/auth", tags=["auth"])


class SignInRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


@router.post("/signin", response_model=TokenResponse)
async def signin(body: SignInRequest, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    # TODO: fetch user from DB, verify password, build Hasura claims
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not yet implemented")


@router.post("/signout")
async def signout() -> dict:
    # JWT is stateless — client discards the token
    return {"message": "Signed out"}
