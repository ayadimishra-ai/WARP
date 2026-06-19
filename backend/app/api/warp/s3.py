from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from pydantic import BaseModel

from app.guards.auth import get_current_user

router = APIRouter(prefix="/s3", tags=["warp-s3"])


class PresignRequest(BaseModel):
    file_key: str
    content_type: str = "application/octet-stream"


@router.post("/upload-url")
async def get_upload_url(
    body: PresignRequest,
    user: dict = Depends(get_current_user),
) -> dict:
    # TODO: boto3 presigned PUT URL — port from apps/web/pages/api/awss3/get-upload-url.ts
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not yet implemented")


@router.get("/download-url")
async def get_download_url(
    file_key: str,
    user: dict = Depends(get_current_user),
) -> dict:
    # TODO: boto3 presigned GET URL — port from apps/web/pages/api/awss3/get-download-url.ts
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not yet implemented")
