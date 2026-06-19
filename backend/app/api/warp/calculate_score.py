from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.guards.auth import get_current_user

router = APIRouter(prefix="/calculate-score", tags=["warp-score"])


class ScoreRequest(BaseModel):
    form_submission_id: str
    company_id: str


class ScoreResponse(BaseModel):
    score: float
    section_scores: dict
    status: str


@router.post("/", response_model=ScoreResponse)
async def calculate_score(
    body: ScoreRequest,
    user: dict = Depends(get_current_user),
) -> ScoreResponse:
    # TODO: port JSONata ESG scoring engine from apps/web/pages/api/calculate-score/index.ts
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not yet implemented")
