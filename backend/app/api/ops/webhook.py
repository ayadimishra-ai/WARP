import hmac

from fastapi import APIRouter, Depends, Header, HTTPException, Request, status

from app.core.config import get_settings

router = APIRouter(prefix="/webhook", tags=["ops-webhook"])
settings = get_settings()


def _verify_webhook_token(x_sk_op_authorization: str = Header(...)) -> None:
    expected = settings.WARP_INTERNAL_SHARED_KEY
    if not expected:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Webhook secret not configured")
    try:
        match = hmac.compare_digest(
            x_sk_op_authorization.encode("utf-8"),
            expected.encode("utf-8"),
        )
    except Exception:
        match = False
    if not match:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")


@router.post("/data-flow", dependencies=[Depends(_verify_webhook_token)])
async def data_flow(request: Request) -> dict:
    """Receives GHG/ESG data pushed from OPS into WARP."""
    # TODO: port from ops/app/api/v1/webhook/data-flow/route.ts
    body = await request.json()
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not yet implemented")
