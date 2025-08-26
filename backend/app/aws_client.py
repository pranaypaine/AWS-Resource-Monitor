import boto3
from typing import Dict, Any, List
import os
from dotenv import load_dotenv

load_dotenv()

class AWSClient:
    def __init__(self):
        self.aws_access_key_id = os.getenv('AWS_ACCESS_KEY_ID')
        self.aws_secret_access_key = os.getenv('AWS_SECRET_ACCESS_KEY')
        self.default_region = os.getenv('AWS_DEFAULT_REGION', 'us-east-1')
        
        # List of all AWS regions
        self.all_regions = [
            'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
            'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-central-1', 'eu-north-1',
            'ap-south-1', 'ap-northeast-1', 'ap-northeast-2', 'ap-southeast-1', 'ap-southeast-2',
            'ca-central-1', 'sa-east-1', 'af-south-1', 'me-south-1',
            'ap-east-1', 'eu-south-1', 'ap-northeast-3'
        ]
        
    def get_client(self, service_name: str, region: str = None):
        """Get AWS service client for specified region"""
        region = region or self.default_region
        return boto3.client(
            service_name,
            aws_access_key_id=self.aws_access_key_id,
            aws_secret_access_key=self.aws_secret_access_key,
            region_name=region
        )
    
    def get_resource(self, service_name: str, region: str = None):
        """Get AWS service resource for specified region"""
        region = region or self.default_region
        return boto3.resource(
            service_name,
            aws_access_key_id=self.aws_access_key_id,
            aws_secret_access_key=self.aws_secret_access_key,
            region_name=region
        )
    
    def get_all_regions(self) -> List[str]:
        """Get list of all available AWS regions"""
        return self.all_regions
    
    def get_available_regions(self, service_name: str) -> List[str]:
        """Get list of regions where a specific service is available"""
        try:
            ec2_client = self.get_client('ec2')
            response = ec2_client.describe_regions()
            return [region['RegionName'] for region in response['Regions']]
        except Exception:
            return self.all_regions

aws_client = AWSClient()
