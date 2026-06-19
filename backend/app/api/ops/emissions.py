from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import UUID4

from app.guards.auth import get_current_user

router = APIRouter(prefix="/emissions", tags=["ops-emissions"])


@router.get("/scope-summary")
async def scope_summary(
    organization_id: UUID4,
    year: int,
    user: dict = Depends(get_current_user),
) -> dict:
    # TODO: aggregate Scope 1/2/3 from ClickHouse or PostgreSQL
    # Port from ops emission calculation engine
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not yet implemented")


@router.get("/monthly-activity-summary")
async def monthly_activity_summary(
    organization_id: UUID4,
    year: int,
    month: str | None = None,
    user: dict = Depends(get_current_user),
) -> dict:
    # TODO: port from ops/app/api/v1/monthly-activity-data/route.ts
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not yet implemented")
