from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, UUID4

from app.guards.auth import get_current_user

router = APIRouter(prefix="/activity", tags=["ops-activity"])


class ActivityDataPayload(BaseModel):
    organization_id: UUID4
    location_id: UUID4
    activity_code: str
    month: str
    year: int
    value: float
    unit: str


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_activity(
    body: ActivityDataPayload,
    user: dict = Depends(get_current_user),
) -> dict:
    # TODO: port from ops/app/api/v1/activity/route.ts
    # Validate org_id against JWT session — never trust client-supplied org
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not yet implemented")


@router.get("/")
async def list_activities(
    organization_id: UUID4,
    month: str | None = None,
    year: int | None = None,
    user: dict = Depends(get_current_user),
) -> list:
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not yet implemented")
