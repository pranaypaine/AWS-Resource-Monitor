from fastapi import APIRouter, HTTPException
from typing import List
from app.models.aws_models import RDSInstance, CreateRDSRequest
from app.services.rds_service import rds_service

router = APIRouter()

@router.get("/instances", response_model=List[RDSInstance])
async def list_instances():
    """List all RDS instances"""
    try:
        return await rds_service.list_instances()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/instances")
async def create_instance(request: CreateRDSRequest):
    """Create a new RDS instance"""
    try:
        return await rds_service.create_instance(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/instances/{db_instance_identifier}")
async def delete_instance(db_instance_identifier: str):
    """Delete an RDS instance"""
    try:
        return await rds_service.delete_instance(db_instance_identifier)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/instances/{db_instance_identifier}/start")
async def start_instance(db_instance_identifier: str):
    """Start an RDS instance"""
    try:
        return await rds_service.start_instance(db_instance_identifier)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/instances/{db_instance_identifier}/stop")
async def stop_instance(db_instance_identifier: str):
    """Stop an RDS instance"""
    try:
        return await rds_service.stop_instance(db_instance_identifier)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
