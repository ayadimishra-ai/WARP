from fastapi import APIRouter

from app.api.ops import activity, emissions, webhook

router = APIRouter(prefix="/ops", tags=["ops"])

router.include_router(activity.router)
router.include_router(emissions.router)
router.include_router(webhook.router)
