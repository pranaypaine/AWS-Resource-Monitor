from fastapi import APIRouter, HTTPException, Request, BackgroundTasks
from typing import Dict, Any
import json
import hmac
import hashlib
from app.services.github_service import deployment_service
from app.models.github_models import DeploymentConfig

router = APIRouter(prefix="/webhooks", tags=["Webhooks"])

# In production, store this securely
WEBHOOK_SECRET = "your-webhook-secret-here"

@router.post("/github")
async def github_webhook(request: Request, background_tasks: BackgroundTasks):
    """Handle GitHub webhook events for automated deployments"""
    
    # Verify webhook signature
    signature = request.headers.get("X-Hub-Signature-256")
    if not signature:
        raise HTTPException(status_code=400, detail="Missing signature")
    
    body = await request.body()
    
    # Verify the payload
    expected_signature = "sha256=" + hmac.new(
        WEBHOOK_SECRET.encode(),
        body,
        hashlib.sha256
    ).hexdigest()
    
    if not hmac.compare_digest(signature, expected_signature):
        raise HTTPException(status_code=403, detail="Invalid signature")
    
    # Parse the payload
    try:
        payload = json.loads(body.decode())
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")
    
    event_type = request.headers.get("X-GitHub-Event")
    
    if event_type == "push":
        # Handle push events for automated deployment
        background_tasks.add_task(handle_push_event, payload)
    elif event_type == "pull_request":
        # Handle PR events for preview deployments
        background_tasks.add_task(handle_pull_request_event, payload)
    
    return {"status": "received"}

async def handle_push_event(payload: Dict[str, Any]):
    """Handle push events for automated deployment"""
    repo_name = payload["repository"]["full_name"]
    branch = payload["ref"].replace("refs/heads/", "")
    
    # Check if this repository has auto-deployment configured
    # In production, store this configuration in a database
    auto_deploy_config = get_auto_deploy_config(repo_name, branch)
    
    if auto_deploy_config:
        try:
            config = DeploymentConfig(**auto_deploy_config)
            await deployment_service.create_deployment(
                access_token=auto_deploy_config["access_token"],
                config=config
            )
        except Exception as e:
            print(f"Auto-deployment failed for {repo_name}:{branch}: {str(e)}")

async def handle_pull_request_event(payload: Dict[str, Any]):
    """Handle pull request events for preview deployments"""
    if payload["action"] in ["opened", "synchronize"]:
        repo_name = payload["repository"]["full_name"]
        pr_number = payload["number"]
        branch = payload["pull_request"]["head"]["ref"]
        
        # Create preview deployment
        preview_config = get_preview_deploy_config(repo_name, branch, pr_number)
        
        if preview_config:
            try:
                config = DeploymentConfig(**preview_config)
                await deployment_service.create_deployment(
                    access_token=preview_config["access_token"],
                    config=config
                )
            except Exception as e:
                print(f"Preview deployment failed for {repo_name}:{branch}: {str(e)}")

def get_auto_deploy_config(repo_name: str, branch: str) -> Dict[str, Any]:
    """Get auto-deployment configuration for a repository and branch"""
    # In production, fetch from database
    # This is a simplified example
    auto_deploy_configs = {
        "user/my-lambda-app": {
            "main": {
                "repository_name": "user/my-lambda-app",
                "branch": "main",
                "aws_service": "lambda",
                "environment": "prod",
                "region": "us-east-1",
                "runtime": "python3.9",
                "access_token": "stored-token"
            },
            "develop": {
                "repository_name": "user/my-lambda-app",
                "branch": "develop",
                "aws_service": "lambda",
                "environment": "dev",
                "region": "us-east-1",
                "runtime": "python3.9",
                "access_token": "stored-token"
            }
        }
    }
    
    return auto_deploy_configs.get(repo_name, {}).get(branch)

def get_preview_deploy_config(repo_name: str, branch: str, pr_number: int) -> Dict[str, Any]:
    """Get preview deployment configuration for a PR"""
    # In production, fetch from database
    preview_configs = {
        "user/my-static-site": {
            "repository_name": "user/my-static-site",
            "branch": branch,
            "aws_service": "s3-static",
            "environment": f"preview-{pr_number}",
            "region": "us-east-1",
            "access_token": "stored-token"
        }
    }
    
    return preview_configs.get(repo_name)
