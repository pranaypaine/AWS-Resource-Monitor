from fastapi import APIRouter, HTTPException
from typing import List
from app.models.aws_models import S3Bucket, CreateS3Request
from app.services.s3_service import s3_service

router = APIRouter()

@router.get("/buckets", response_model=List[S3Bucket])
async def list_buckets():
    """List all S3 buckets"""
    try:
        return await s3_service.list_buckets()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/buckets")
async def create_bucket(request: CreateS3Request):
    """Create a new S3 bucket"""
    try:
        return await s3_service.create_bucket(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/buckets/{bucket_name}")
async def delete_bucket(bucket_name: str):
    """Delete an S3 bucket"""
    try:
        return await s3_service.delete_bucket(bucket_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/buckets/{bucket_name}/objects")
async def list_objects(bucket_name: str):
    """List objects in an S3 bucket"""
    try:
        return await s3_service.list_objects(bucket_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
