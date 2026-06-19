from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.guards.auth import get_current_user

router = APIRouter(prefix="/forms", tags=["warp-forms"])


class AnswerPayload(BaseModel):
    form_submission_id: str
    question_id: str
    value: str | list | None


@router.post("/save-answers", status_code=status.HTTP_204_NO_CONTENT)
async def save_answers(
    body: list[AnswerPayload],
    user: dict = Depends(get_current_user),
) -> None:
    # TODO: port from apps/web/pages/api/saveAnswers/index.ts
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not yet implemented")


@router.post("/submit", status_code=status.HTTP_204_NO_CONTENT)
async def submit_form(
    body: dict,
    user: dict = Depends(get_current_user),
) -> None:
    # TODO: port from apps/web/pages/api/submit-form.ts
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not yet implemented")
