from typing import List
from app.aws_client import aws_client
from app.models.aws_models import RDSInstance, CreateRDSRequest
from botocore.exceptions import ClientError

class RDSService:
    def __init__(self):
        self.rds_client = aws_client.get_client('rds')

    async def list_instances(self) -> List[RDSInstance]:
        """List all RDS instances"""
        try:
            response = self.rds_client.describe_db_instances()
            instances = []
            
            for db_instance in response['DBInstances']:
                rds_instance = RDSInstance(
                    db_instance_identifier=db_instance['DBInstanceIdentifier'],
                    db_instance_class=db_instance['DBInstanceClass'],
                    engine=db_instance['Engine'],
                    status=db_instance['DBInstanceStatus'],
                    endpoint=db_instance.get('Endpoint', {}).get('Address'),
                    port=db_instance.get('Endpoint', {}).get('Port'),
                    allocated_storage=db_instance.get('AllocatedStorage')
                )
                instances.append(rds_instance)
            
            return instances
        except ClientError as e:
            raise Exception(f"Error listing RDS instances: {str(e)}")

    async def create_instance(self, request: CreateRDSRequest) -> dict:
        """Create a new RDS instance"""
        try:
            response = self.rds_client.create_db_instance(
                DBInstanceIdentifier=request.db_instance_identifier,
                DBInstanceClass=request.db_instance_class,
                Engine=request.engine,
                MasterUsername=request.master_username,
                MasterUserPassword=request.master_password,
                AllocatedStorage=request.allocated_storage,
                BackupRetentionPeriod=0,  # Disable automated backups for cost savings
                MultiAZ=False,
                PubliclyAccessible=True,
                StorageType='gp2'
            )
            return response
        except ClientError as e:
            raise Exception(f"Error creating RDS instance: {str(e)}")

    async def delete_instance(self, db_instance_identifier: str) -> dict:
        """Delete an RDS instance"""
        try:
            response = self.rds_client.delete_db_instance(
                DBInstanceIdentifier=db_instance_identifier,
                SkipFinalSnapshot=True
            )
            return response
        except ClientError as e:
            raise Exception(f"Error deleting RDS instance: {str(e)}")

    async def start_instance(self, db_instance_identifier: str) -> dict:
        """Start an RDS instance"""
        try:
            response = self.rds_client.start_db_instance(
                DBInstanceIdentifier=db_instance_identifier
            )
            return response
        except ClientError as e:
            raise Exception(f"Error starting RDS instance: {str(e)}")

    async def stop_instance(self, db_instance_identifier: str) -> dict:
        """Stop an RDS instance"""
        try:
            response = self.rds_client.stop_db_instance(
                DBInstanceIdentifier=db_instance_identifier
            )
            return response
        except ClientError as e:
            raise Exception(f"Error stopping RDS instance: {str(e)}")

rds_service = RDSService()
