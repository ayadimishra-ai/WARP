from fastapi import APIRouter

from app.api.warp import calculate_score, forms, rara, s3

router = APIRouter(prefix="/warp", tags=["warp"])

router.include_router(calculate_score.router)
router.include_router(forms.router)
router.include_router(rara.router)
router.include_router(s3.router)
