from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.guards.auth import get_current_user

router = APIRouter(prefix="/rara", tags=["warp-rara"])


class DocumentRatingRequest(BaseModel):
    document_id: str
    form_invitation_id: str


@router.post("/document-rating")
async def document_rating(
    body: DocumentRatingRequest,
    user: dict = Depends(get_current_user),
) -> dict:
    # TODO: fetch RARA URL + auth_key from GlobalMaster table (never from request body)
    # port from apps/web/pages/api/rara/document-rating.ts
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not yet implemented")


@router.post("/document-validation")
async def document_validation(
    body: dict,
    user: dict = Depends(get_current_user),
) -> dict:
    # TODO: port from apps/web/pages/api/rara/document-validation.ts
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not yet implemented")
