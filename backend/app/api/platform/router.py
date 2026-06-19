from fastapi import APIRouter

from app.api.platform import company, user

router = APIRouter(prefix="/platform", tags=["platform"])

router.include_router(company.router)
router.include_router(user.router)
