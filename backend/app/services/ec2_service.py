from typing import List
from app.aws_client import aws_client
from app.models.aws_models import EC2Instance, CreateEC2Request
import boto3
from botocore.exceptions import ClientError

class EC2Service:
    def __init__(self):
        pass

    async def list_instances(self, region: str = None) -> List[EC2Instance]:
        """List all EC2 instances in specified region or all regions"""
        try:
            instances = []
            regions_to_check = [region] if region else aws_client.get_all_regions()
            
            for current_region in regions_to_check:
                try:
                    ec2_client = aws_client.get_client('ec2', current_region)
                    response = ec2_client.describe_instances()
                    
                    for reservation in response['Reservations']:
                        for instance in reservation['Instances']:
                            tags = {tag['Key']: tag['Value'] for tag in instance.get('Tags', [])}
                            
                            ec2_instance = EC2Instance(
                                instance_id=instance['InstanceId'],
                                instance_type=instance['InstanceType'],
                                state=instance['State']['Name'],
                                public_ip=instance.get('PublicIpAddress'),
                                private_ip=instance.get('PrivateIpAddress'),
                                launch_time=instance.get('LaunchTime'),
                                tags=tags,
                                region=current_region
                            )
                            instances.append(ec2_instance)
                except Exception as e:
                    # Skip regions where we don't have access or service isn't available
                    print(f"Skipping region {current_region}: {str(e)}")
                    continue
            
            return instances
        except ClientError as e:
            raise Exception(f"Error listing EC2 instances: {str(e)}")

    async def create_instance(self, request: CreateEC2Request, region: str = None) -> dict:
        """Create a new EC2 instance in specified region"""
        try:
            ec2_client = aws_client.get_client('ec2', region)
            
            params = {
                'ImageId': request.ami_id,
                'MinCount': 1,
                'MaxCount': 1,
                'InstanceType': request.instance_type
            }
            
            if request.key_name:
                params['KeyName'] = request.key_name
            
            if request.security_groups:
                params['SecurityGroups'] = request.security_groups
            
            if request.tags:
                tag_specifications = [{
                    'ResourceType': 'instance',
                    'Tags': [{'Key': k, 'Value': v} for k, v in request.tags.items()]
                }]
                params['TagSpecifications'] = tag_specifications
            
            response = ec2_client.run_instances(**params)
            return response['Instances'][0]
        except ClientError as e:
            raise Exception(f"Error creating EC2 instance: {str(e)}")

    async def terminate_instance(self, instance_id: str, region: str = None) -> dict:
        """Terminate an EC2 instance"""
        try:
            ec2_client = aws_client.get_client('ec2', region)
            response = ec2_client.terminate_instances(InstanceIds=[instance_id])
            return response
        except ClientError as e:
            raise Exception(f"Error terminating EC2 instance: {str(e)}")

    async def start_instance(self, instance_id: str, region: str = None) -> dict:
        """Start an EC2 instance"""
        try:
            ec2_client = aws_client.get_client('ec2', region)
            response = ec2_client.start_instances(InstanceIds=[instance_id])
            return response
        except ClientError as e:
            raise Exception(f"Error starting EC2 instance: {str(e)}")

    async def stop_instance(self, instance_id: str, region: str = None) -> dict:
        """Stop an EC2 instance"""
        try:
            ec2_client = aws_client.get_client('ec2', region)
            response = ec2_client.stop_instances(InstanceIds=[instance_id])
            return response
        except ClientError as e:
            raise Exception(f"Error stopping EC2 instance: {str(e)}")

    async def get_regions(self) -> List[str]:
        """Get all available AWS regions"""
        return aws_client.get_all_regions()

ec2_service = EC2Service()
