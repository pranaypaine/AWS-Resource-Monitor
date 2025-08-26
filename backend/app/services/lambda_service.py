from typing import List
from app.aws_client import aws_client
from app.models.aws_models import LambdaFunction, CreateLambdaRequest
from botocore.exceptions import ClientError
import base64

class LambdaService:
    def __init__(self):
        self.lambda_client = aws_client.get_client('lambda')

    async def list_functions(self) -> List[LambdaFunction]:
        """List all Lambda functions"""
        try:
            response = self.lambda_client.list_functions()
            functions = []
            
            for function in response['Functions']:
                lambda_function = LambdaFunction(
                    function_name=function['FunctionName'],
                    runtime=function['Runtime'],
                    handler=function['Handler'],
                    role=function['Role'],
                    code_size=function['CodeSize'],
                    last_modified=function['LastModified']
                )
                functions.append(lambda_function)
            
            return functions
        except ClientError as e:
            raise Exception(f"Error listing Lambda functions: {str(e)}")

    async def create_function(self, request: CreateLambdaRequest) -> dict:
        """Create a new Lambda function"""
        try:
            # Encode the code as base64
            code_bytes = request.code.encode('utf-8')
            
            response = self.lambda_client.create_function(
                FunctionName=request.function_name,
                Runtime=request.runtime,
                Role=request.role,
                Handler=request.handler,
                Code={
                    'ZipFile': code_bytes
                },
                Description='Created via AWS Resource Monitor'
            )
            return response
        except ClientError as e:
            raise Exception(f"Error creating Lambda function: {str(e)}")

    async def delete_function(self, function_name: str) -> dict:
        """Delete a Lambda function"""
        try:
            response = self.lambda_client.delete_function(FunctionName=function_name)
            return response
        except ClientError as e:
            raise Exception(f"Error deleting Lambda function: {str(e)}")

    async def invoke_function(self, function_name: str, payload: dict = None) -> dict:
        """Invoke a Lambda function"""
        try:
            import json
            
            params = {'FunctionName': function_name}
            if payload:
                params['Payload'] = json.dumps(payload)
            
            response = self.lambda_client.invoke(**params)
            return response
        except ClientError as e:
            raise Exception(f"Error invoking Lambda function: {str(e)}")

    async def get_function(self, function_name: str) -> dict:
        """Get Lambda function details"""
        try:
            response = self.lambda_client.get_function(FunctionName=function_name)
            return response
        except ClientError as e:
            raise Exception(f"Error getting Lambda function: {str(e)}")

lambda_service = LambdaService()
