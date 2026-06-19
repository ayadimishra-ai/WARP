from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.api.auth.router import router as auth_router
from app.api.ops.router import router as ops_router
from app.api.platform.router import router as platform_router
from app.api.warp.router import router as warp_router
from app.core.config import get_settings
from app.db.session import engine

logger = structlog.get_logger()
settings = get_settings()

limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("startup", env=settings.APP_ENV)
    yield
    await engine.dispose()
    logger.info("shutdown")


app = FastAPI(
    title="Snowkap ESG Platform API",
    version="2.0.0",
    docs_url="/api/docs" if settings.APP_ENV != "live" else None,
    redoc_url="/api/redoc" if settings.APP_ENV != "live" else None,
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.PARENT_ORIGIN, settings.APP_BASE_URL],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type", "x-warp-shared-key"],
)

app.include_router(auth_router, prefix="/api/v1")
app.include_router(warp_router, prefix="/api/v1")
app.include_router(ops_router, prefix="/api/v1")
app.include_router(platform_router, prefix="/api/v1")


@app.get("/api/health")
async def health() -> dict:
    return {"status": "ok", "env": settings.APP_ENV}
