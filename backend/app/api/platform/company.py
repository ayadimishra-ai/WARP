from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, UUID4

from app.guards.auth import get_current_user

router = APIRouter(prefix="/company", tags=["platform-company"])


class CompanyCreate(BaseModel):
    name: str
    primary_contact_email: EmailStr
    platform_id: UUID4


class CompanyUpdate(BaseModel):
    name: str | None = None
    primary_contact_email: EmailStr | None = None


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_company(body: CompanyCreate, user: dict = Depends(get_current_user)) -> dict:
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not yet implemented")


@router.get("/{company_id}")
async def get_company(company_id: UUID4, user: dict = Depends(get_current_user)) -> dict:
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not yet implemented")


@router.patch("/{company_id}")
async def update_company(company_id: UUID4, body: CompanyUpdate, user: dict = Depends(get_current_user)) -> dict:
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not yet implemented")


@router.delete("/{company_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_company(company_id: UUID4, user: dict = Depends(get_current_user)) -> None:
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not yet implemented")
