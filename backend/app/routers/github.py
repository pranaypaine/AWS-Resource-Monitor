from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from app.models.github_models import (
    GitHubRepository, 
    DeploymentConfig, 
    Deployment,
    ConnectRepositoryRequest,
    CreateDeploymentRequest
)
from app.services.github_service import github_service, deployment_service

router = APIRouter(prefix="/github", tags=["GitHub"])

@router.post("/repositories", response_model=List[GitHubRepository])
async def get_repositories(request: ConnectRepositoryRequest):
    """Get user's GitHub repositories"""
    try:
        repositories = github_service.get_user_repositories(request.access_token)
        return repositories
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to fetch repositories: {str(e)}"
        )

@router.get("/repositories/{repo_full_name}/content")
async def get_repository_content(
    repo_full_name: str,
    access_token: str,
    path: str = ""
):
    """Get repository content"""
    try:
        content = github_service.get_repository_content(access_token, repo_full_name, path)
        return content
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to fetch repository content: {str(e)}"
        )

@router.post("/deploy", response_model=Deployment)
async def create_deployment(request: CreateDeploymentRequest):
    """Create a new deployment"""
    try:
        deployment = await deployment_service.create_deployment(
            request.access_token,
            request.config
        )
        return deployment
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create deployment: {str(e)}"
        )

@router.get("/deployments", response_model=List[Deployment])
async def list_deployments():
    """List all deployments"""
    deployments = deployment_service.list_deployments()
    return deployments

@router.get("/deployments/{deployment_id}", response_model=Deployment)
async def get_deployment(deployment_id: str):
    """Get deployment by ID"""
    deployment = deployment_service.get_deployment(deployment_id)
    if not deployment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deployment not found"
        )
    return deployment

@router.get("/deployment-templates")
async def get_deployment_templates():
    """Get available deployment templates"""
    templates = {
        "lambda": {
            "name": "AWS Lambda",
            "description": "Deploy serverless functions to AWS Lambda",
            "supported_runtimes": [
                "python3.9", "python3.8", "nodejs16.x", "nodejs14.x", 
                "java11", "java8", "dotnet6", "go1.x"
            ],
            "required_files": ["handler file (e.g., index.js, lambda_function.py)"],
            "environment_variables": True,
            "auto_scaling": True
        },
        "s3-static": {
            "name": "S3 Static Website",
            "description": "Deploy static websites to S3 with automatic hosting setup",
            "supported_files": ["HTML", "CSS", "JavaScript", "Images"],
            "required_files": ["index.html"],
            "cdn_support": "CloudFront can be added",
            "custom_domain": True
        },
        "ec2": {
            "name": "EC2 Instance",
            "description": "Deploy applications to EC2 instances",
            "deployment_methods": ["CodeDeploy", "Docker", "Direct upload"],
            "instance_types": ["t2.micro", "t2.small", "t3.medium", "t3.large"],
            "auto_scaling": True,
            "load_balancer": True
        },
        "ecs": {
            "name": "ECS Container",
            "description": "Deploy containerized applications to ECS",
            "container_platforms": ["Fargate", "EC2"],
            "required_files": ["Dockerfile"],
            "auto_scaling": True,
            "load_balancer": True
        }
    }
    return templates

@router.get("/aws-regions")
async def get_aws_regions():
    """Get available AWS regions for deployment"""
    regions = [
        {"code": "us-east-1", "name": "US East (N. Virginia)"},
        {"code": "us-west-2", "name": "US West (Oregon)"},
        {"code": "eu-west-1", "name": "Europe (Ireland)"},
        {"code": "ap-southeast-1", "name": "Asia Pacific (Singapore)"},
        {"code": "ap-northeast-1", "name": "Asia Pacific (Tokyo)"},
        {"code": "ca-central-1", "name": "Canada (Central)"},
        {"code": "sa-east-1", "name": "South America (São Paulo)"}
    ]
    return regions
