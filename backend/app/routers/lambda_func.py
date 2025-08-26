from fastapi import APIRouter, HTTPException
from typing import List
from app.models.aws_models import LambdaFunction, CreateLambdaRequest
from app.services.lambda_service import lambda_service

router = APIRouter()

@router.get("/functions", response_model=List[LambdaFunction])
async def list_functions():
    """List all Lambda functions"""
    try:
        return await lambda_service.list_functions()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/functions")
async def create_function(request: CreateLambdaRequest):
    """Create a new Lambda function"""
    try:
        return await lambda_service.create_function(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/functions/{function_name}")
async def delete_function(function_name: str):
    """Delete a Lambda function"""
    try:
        return await lambda_service.delete_function(function_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/functions/{function_name}/invoke")
async def invoke_function(function_name: str, payload: dict = None):
    """Invoke a Lambda function"""
    try:
        return await lambda_service.invoke_function(function_name, payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/functions/{function_name}")
async def get_function(function_name: str):
    """Get Lambda function details"""
    try:
        return await lambda_service.get_function(function_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
