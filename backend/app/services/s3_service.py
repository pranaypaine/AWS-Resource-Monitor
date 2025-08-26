from typing import List
from app.aws_client import aws_client
from app.models.aws_models import S3Bucket, CreateS3Request
from botocore.exceptions import ClientError

class S3Service:
    def __init__(self):
        pass

    async def list_buckets(self) -> List[S3Bucket]:
        """List all S3 buckets"""
        try:
            s3_client = aws_client.get_client('s3')
            response = s3_client.list_buckets()
            buckets = []
            
            for bucket in response['Buckets']:
                # Get bucket location
                try:
                    location_response = s3_client.get_bucket_location(Bucket=bucket['Name'])
                    region = location_response['LocationConstraint'] or 'us-east-1'
                except:
                    region = 'us-east-1'
                
                s3_bucket = S3Bucket(
                    name=bucket['Name'],
                    creation_date=bucket['CreationDate'],
                    region=region
                )
                buckets.append(s3_bucket)
            
            return buckets
        except ClientError as e:
            raise Exception(f"Error listing S3 buckets: {str(e)}")

    async def create_bucket(self, request: CreateS3Request) -> dict:
        """Create a new S3 bucket"""
        try:
            s3_client = aws_client.get_client('s3', request.region)
            params = {'Bucket': request.bucket_name}
            
            # Only specify location constraint if not us-east-1
            if request.region != 'us-east-1':
                params['CreateBucketConfiguration'] = {'LocationConstraint': request.region}
            
            response = s3_client.create_bucket(**params)
            return response
        except ClientError as e:
            raise Exception(f"Error creating S3 bucket: {str(e)}")

    async def delete_bucket(self, bucket_name: str) -> dict:
        """Delete an S3 bucket"""
        try:
            # First get the bucket region
            s3_client = aws_client.get_client('s3')
            try:
                location_response = s3_client.get_bucket_location(Bucket=bucket_name)
                region = location_response['LocationConstraint'] or 'us-east-1'
            except:
                region = 'us-east-1'
            
            s3_client = aws_client.get_client('s3', region)
            
            # First, delete all objects in the bucket
            objects_response = s3_client.list_objects_v2(Bucket=bucket_name)
            if 'Contents' in objects_response:
                objects = [{'Key': obj['Key']} for obj in objects_response['Contents']]
                s3_client.delete_objects(
                    Bucket=bucket_name,
                    Delete={'Objects': objects}
                )
            
            # Then delete the bucket
            response = s3_client.delete_bucket(Bucket=bucket_name)
            return response
        except ClientError as e:
            raise Exception(f"Error deleting S3 bucket: {str(e)}")

    async def list_objects(self, bucket_name: str) -> dict:
        """List objects in an S3 bucket"""
        try:
            # First get the bucket region
            s3_client = aws_client.get_client('s3')
            try:
                location_response = s3_client.get_bucket_location(Bucket=bucket_name)
                region = location_response['LocationConstraint'] or 'us-east-1'
            except:
                region = 'us-east-1'
            
            s3_client = aws_client.get_client('s3', region)
            response = s3_client.list_objects_v2(Bucket=bucket_name)
            return response
        except ClientError as e:
            raise Exception(f"Error listing S3 objects: {str(e)}")

s3_service = S3Service()
