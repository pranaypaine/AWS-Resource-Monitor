from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class GitHubRepository(BaseModel):
    id: int
    name: str
    full_name: str
    description: Optional[str] = None
    html_url: str
    clone_url: str
    ssh_url: str
    default_branch: str
    language: Optional[str] = None
    private: bool
    created_at: datetime
    updated_at: datetime

class GitHubWebhook(BaseModel):
    id: int
    url: str
    events: List[str]
    active: bool
    config: Dict[str, Any]

class DeploymentConfig(BaseModel):
    repository_id: int
    repository_name: str
    branch: str = "main"
    aws_service: str  # "lambda", "ec2", "ecs", "s3-static"
    deployment_type: str  # "auto", "manual"
    environment: str = "production"
    build_command: Optional[str] = None
    runtime: Optional[str] = None
    environment_variables: Optional[Dict[str, str]] = {}

class Deployment(BaseModel):
    id: str
    repository_name: str
    branch: str
    commit_sha: str
    aws_service: str
    status: str  # "pending", "building", "deploying", "success", "failed"
    created_at: datetime
    completed_at: Optional[datetime] = None
    logs: Optional[str] = None
    deployment_url: Optional[str] = None

class GitHubConnectRequest(BaseModel):
    access_token: str

class ConnectRepositoryRequest(BaseModel):
    access_token: str

class CreateDeploymentRequest(BaseModel):
    access_token: str
    config: DeploymentConfig
