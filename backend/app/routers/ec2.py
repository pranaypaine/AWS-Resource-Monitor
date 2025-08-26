from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.models.aws_models import EC2Instance, CreateEC2Request
from app.services.ec2_service import ec2_service

router = APIRouter()

@router.get("/regions")
async def get_regions():
    """Get all available AWS regions"""
    try:
        return await ec2_service.get_regions()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/instances", response_model=List[EC2Instance])
async def list_instances(region: Optional[str] = Query(None, description="AWS region to filter by")):
    """List all EC2 instances"""
    try:
        return await ec2_service.list_instances(region)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/instances")
async def create_instance(request: CreateEC2Request):
    """Create a new EC2 instance"""
    try:
        return await ec2_service.create_instance(request, request.region)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/instances/{instance_id}")
async def terminate_instance(instance_id: str, region: Optional[str] = Query(None)):
    """Terminate an EC2 instance"""
    try:
        return await ec2_service.terminate_instance(instance_id, region)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/instances/{instance_id}/start")
async def start_instance(instance_id: str, region: Optional[str] = Query(None)):
    """Start an EC2 instance"""
    try:
        return await ec2_service.start_instance(instance_id, region)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/instances/{instance_id}/stop")
async def stop_instance(instance_id: str, region: Optional[str] = Query(None)):
    """Stop an EC2 instance"""
    try:
        return await ec2_service.stop_instance(instance_id, region)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
