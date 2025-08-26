import requests
import boto3
import json
import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.models.github_models import GitHubRepository, DeploymentConfig, Deployment
from app.aws_client import aws_client
import base64
import zipfile
import io
import os

class GitHubService:
    def __init__(self):
        self.base_url = "https://api.github.com"
        
    def get_user_repositories(self, access_token: str) -> List[GitHubRepository]:
        """Get user's GitHub repositories"""
        headers = {
            "Authorization": f"token {access_token}",
            "Accept": "application/vnd.github.v3+json"
        }
        
        try:
            response = requests.get(f"{self.base_url}/user/repos", headers=headers)
            response.raise_for_status()
            
            repos = []
            for repo_data in response.json():
                repo = GitHubRepository(
                    id=repo_data["id"],
                    name=repo_data["name"],
                    full_name=repo_data["full_name"],
                    description=repo_data.get("description"),
                    html_url=repo_data["html_url"],
                    clone_url=repo_data["clone_url"],
                    ssh_url=repo_data["ssh_url"],
                    default_branch=repo_data["default_branch"],
                    language=repo_data.get("language"),
                    private=repo_data["private"],
                    created_at=datetime.fromisoformat(repo_data["created_at"].replace("Z", "+00:00")),
                    updated_at=datetime.fromisoformat(repo_data["updated_at"].replace("Z", "+00:00"))
                )
                repos.append(repo)
            
            return repos
        except requests.RequestException as e:
            raise Exception(f"Failed to fetch repositories: {str(e)}")
    
    def get_repository_content(self, access_token: str, repo_full_name: str, path: str = "") -> Dict[str, Any]:
        """Get repository content"""
        headers = {
            "Authorization": f"token {access_token}",
            "Accept": "application/vnd.github.v3+json"
        }
        
        try:
            url = f"{self.base_url}/repos/{repo_full_name}/contents/{path}"
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            raise Exception(f"Failed to fetch repository content: {str(e)}")
    
    def download_repository_archive(self, access_token: str, repo_full_name: str, branch: str = "main") -> bytes:
        """Download repository as ZIP archive"""
        headers = {
            "Authorization": f"token {access_token}",
            "Accept": "application/vnd.github.v3+json"
        }
        
        try:
            url = f"{self.base_url}/repos/{repo_full_name}/zipball/{branch}"
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            return response.content
        except requests.RequestException as e:
            raise Exception(f"Failed to download repository: {str(e)}")

class DeploymentService:
    def __init__(self):
        self.github_service = GitHubService()
        self.deployments = {}  # In production, use a database
        
    async def create_deployment(self, access_token: str, config: DeploymentConfig) -> Deployment:
        """Create a new deployment"""
        deployment_id = str(uuid.uuid4())
        
        deployment = Deployment(
            id=deployment_id,
            repository_name=config.repository_name,
            branch=config.branch,
            commit_sha="latest",  # In production, get actual commit SHA
            aws_service=config.aws_service,
            status="pending",
            created_at=datetime.now()
        )
        
        self.deployments[deployment_id] = deployment
        
        # Start deployment process
        if config.aws_service == "lambda":
            await self._deploy_to_lambda(access_token, config, deployment)
        elif config.aws_service == "s3-static":
            await self._deploy_to_s3_static(access_token, config, deployment)
        elif config.aws_service == "ec2":
            await self._deploy_to_ec2(access_token, config, deployment)
        
        return deployment
    
    async def _deploy_to_lambda(self, access_token: str, config: DeploymentConfig, deployment: Deployment):
        """Deploy to AWS Lambda"""
        try:
            deployment.status = "building"
            deployment.logs = "Downloading repository...\n"
            
            # Download repository
            repo_archive = self.github_service.download_repository_archive(
                access_token, config.repository_name, config.branch
            )
            
            deployment.logs += "Creating Lambda function...\n"
            
            # Create Lambda function
            lambda_client = aws_client.get_client('lambda')
            
            function_name = f"{config.repository_name.replace('/', '-')}-{config.environment}"
            
            # Prepare the deployment package
            zip_buffer = io.BytesIO(repo_archive)
            
            lambda_params = {
                'FunctionName': function_name,
                'Runtime': config.runtime or 'python3.9',
                'Role': self._get_lambda_execution_role(),
                'Handler': 'index.handler',
                'Code': {'ZipFile': repo_archive},
                'Environment': {
                    'Variables': config.environment_variables or {}
                },
                'Description': f'Deployed from {config.repository_name}'
            }
            
            try:
                response = lambda_client.create_function(**lambda_params)
            except lambda_client.exceptions.ResourceConflictException:
                # Function exists, update it
                response = lambda_client.update_function_code(
                    FunctionName=function_name,
                    ZipFile=repo_archive
                )
                lambda_client.update_function_configuration(
                    FunctionName=function_name,
                    Runtime=config.runtime or 'python3.9',
                    Environment={
                        'Variables': config.environment_variables or {}
                    }
                )
            
            deployment.status = "success"
            deployment.completed_at = datetime.now()
            deployment.deployment_url = f"https://console.aws.amazon.com/lambda/home?region=us-east-1#/functions/{function_name}"
            deployment.logs += f"Lambda function {function_name} deployed successfully!\n"
            
        except Exception as e:
            deployment.status = "failed"
            deployment.completed_at = datetime.now()
            deployment.logs += f"Deployment failed: {str(e)}\n"
    
    async def _deploy_to_s3_static(self, access_token: str, config: DeploymentConfig, deployment: Deployment):
        """Deploy static site to S3"""
        try:
            deployment.status = "building"
            deployment.logs = "Downloading repository...\n"
            
            # Download repository
            repo_archive = self.github_service.download_repository_archive(
                access_token, config.repository_name, config.branch
            )
            
            deployment.logs += "Creating S3 bucket for static hosting...\n"
            
            # Create S3 bucket
            s3_client = aws_client.get_client('s3')
            bucket_name = f"{config.repository_name.replace('/', '-')}-{config.environment}".lower()
            
            try:
                s3_client.create_bucket(Bucket=bucket_name)
            except s3_client.exceptions.BucketAlreadyExists:
                pass
            
            # Configure static website hosting
            s3_client.put_bucket_website(
                Bucket=bucket_name,
                WebsiteConfiguration={
                    'IndexDocument': {'Suffix': 'index.html'},
                    'ErrorDocument': {'Key': 'error.html'}
                }
            )
            
            # Make bucket public
            s3_client.put_bucket_policy(
                Bucket=bucket_name,
                Policy=json.dumps({
                    "Version": "2012-10-17",
                    "Statement": [{
                        "Effect": "Allow",
                        "Principal": "*",
                        "Action": "s3:GetObject",
                        "Resource": f"arn:aws:s3:::{bucket_name}/*"
                    }]
                })
            )
            
            deployment.logs += "Uploading files to S3...\n"
            
            # Extract and upload files
            with zipfile.ZipFile(io.BytesIO(repo_archive), 'r') as zip_ref:
                for file_info in zip_ref.filelist:
                    if not file_info.is_dir() and not file_info.filename.startswith('.'):
                        # Get clean filename (remove repo prefix)
                        clean_name = '/'.join(file_info.filename.split('/')[1:])
                        if clean_name:
                            file_content = zip_ref.read(file_info.filename)
                            s3_client.put_object(
                                Bucket=bucket_name,
                                Key=clean_name,
                                Body=file_content,
                                ContentType=self._get_content_type(clean_name)
                            )
            
            deployment.status = "success"
            deployment.completed_at = datetime.now()
            deployment.deployment_url = f"http://{bucket_name}.s3-website-us-east-1.amazonaws.com"
            deployment.logs += f"Static site deployed successfully to {deployment.deployment_url}\n"
            
        except Exception as e:
            deployment.status = "failed"
            deployment.completed_at = datetime.now()
            deployment.logs += f"Deployment failed: {str(e)}\n"
    
    async def _deploy_to_ec2(self, access_token: str, config: DeploymentConfig, deployment: Deployment):
        """Deploy to EC2 (simplified version)"""
        deployment.status = "failed"
        deployment.completed_at = datetime.now()
        deployment.logs = "EC2 deployment not implemented in this demo. Consider using AWS CodeDeploy for production EC2 deployments.\n"
    
    def _get_lambda_execution_role(self) -> str:
        """Get or create Lambda execution role"""
        # In production, create a proper IAM role
        return "arn:aws:iam::123456789012:role/lambda-execution-role"
    
    def _get_content_type(self, filename: str) -> str:
        """Get content type based on file extension"""
        ext = filename.split('.')[-1].lower()
        content_types = {
            'html': 'text/html',
            'css': 'text/css',
            'js': 'application/javascript',
            'json': 'application/json',
            'png': 'image/png',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'gif': 'image/gif',
            'svg': 'image/svg+xml',
            'ico': 'image/x-icon'
        }
        return content_types.get(ext, 'application/octet-stream')
    
    def get_deployment(self, deployment_id: str) -> Optional[Deployment]:
        """Get deployment by ID"""
        return self.deployments.get(deployment_id)
    
    def list_deployments(self) -> List[Deployment]:
        """List all deployments"""
        return list(self.deployments.values())

github_service = GitHubService()
deployment_service = DeploymentService()
