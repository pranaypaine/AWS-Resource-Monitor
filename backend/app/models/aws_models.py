from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class EC2Instance(BaseModel):
    instance_id: str
    instance_type: str
    state: str
    public_ip: Optional[str] = None
    private_ip: Optional[str] = None
    launch_time: Optional[datetime] = None
    tags: Optional[Dict[str, str]] = {}
    region: Optional[str] = None

class CreateEC2Request(BaseModel):
    instance_type: str = "t2.micro"
    ami_id: str = "ami-0c02fb55956c7d316"  # Amazon Linux 2
    key_name: Optional[str] = None
    security_groups: Optional[List[str]] = []
    tags: Optional[Dict[str, str]] = {}
    region: Optional[str] = None

class S3Bucket(BaseModel):
    name: str
    creation_date: Optional[datetime] = None
    region: Optional[str] = None

class CreateS3Request(BaseModel):
    bucket_name: str
    region: str = "us-east-1"

class RDSInstance(BaseModel):
    db_instance_identifier: str
    db_instance_class: str
    engine: str
    status: str
    endpoint: Optional[str] = None
    port: Optional[int] = None
    allocated_storage: Optional[int] = None
    region: Optional[str] = None

class CreateRDSRequest(BaseModel):
    db_instance_identifier: str
    db_instance_class: str = "db.t3.micro"
    engine: str = "mysql"
    master_username: str
    master_password: str
    allocated_storage: int = 20
    region: Optional[str] = None

class LambdaFunction(BaseModel):
    function_name: str
    runtime: str
    handler: str
    role: str
    code_size: Optional[int] = None
    last_modified: Optional[str] = None
    region: Optional[str] = None

class CreateLambdaRequest(BaseModel):
    function_name: str
    runtime: str = "python3.9"
    handler: str = "lambda_function.lambda_handler"
    role: str
    code: str
    region: Optional[str] = None
