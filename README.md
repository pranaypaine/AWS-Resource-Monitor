# AWS Resource Monitor

A comprehensive web application for monitoring and managing AWS resources with a Python FastAPI backend and React frontend.

## Features

### Backend (FastAPI)
- **EC2 Management**: List, create, start, stop, and terminate EC2 instances
- **S3 Management**: List, create, and delete S3 buckets
- **RDS Management**: List, create, start, stop, and delete RDS instances  
- **Lambda Management**: List, create, delete, and invoke Lambda functions
- **Secure AWS Integration**: Uses boto3 with configurable AWS credentials
- **RESTful API**: Well-documented API endpoints with automatic OpenAPI documentation

### Frontend (React)
- **Dashboard**: Overview of all AWS resources with statistics
- **Resource Management**: Dedicated pages for each AWS service
- **Real-time Updates**: Automatic refresh of resource states
- **Responsive Design**: Mobile-friendly interface
- **Interactive Forms**: Easy resource creation with validation
- **Toast Notifications**: User feedback for all operations

## Prerequisites

- Python 3.8+
- Node.js 16+
- AWS Account with access keys
- AWS CLI configured (optional)

## Setup Instructions

### 1. Clone and Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure AWS credentials
cp .env.example .env
# Edit .env file with your AWS credentials
```

### 2. Configure AWS Credentials

Edit `backend/.env` file:

```env
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
AWS_DEFAULT_REGION=us-east-1
DEBUG=True
```

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install
```

## Running the Application

### Start Backend Server

```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

### Start Frontend Server

```bash
cd frontend
npm start
```

The web application will be available at `http://localhost:3000`

## API Endpoints

### EC2 Endpoints
- `GET /api/ec2/instances` - List all EC2 instances
- `POST /api/ec2/instances` - Create new EC2 instance
- `DELETE /api/ec2/instances/{instance_id}` - Terminate instance
- `POST /api/ec2/instances/{instance_id}/start` - Start instance
- `POST /api/ec2/instances/{instance_id}/stop` - Stop instance

### S3 Endpoints
- `GET /api/s3/buckets` - List all S3 buckets
- `POST /api/s3/buckets` - Create new S3 bucket
- `DELETE /api/s3/buckets/{bucket_name}` - Delete bucket
- `GET /api/s3/buckets/{bucket_name}/objects` - List bucket objects

### RDS Endpoints
- `GET /api/rds/instances` - List all RDS instances
- `POST /api/rds/instances` - Create new RDS instance
- `DELETE /api/rds/instances/{db_instance_id}` - Delete instance
- `POST /api/rds/instances/{db_instance_id}/start` - Start instance
- `POST /api/rds/instances/{db_instance_id}/stop` - Stop instance

### Lambda Endpoints
- `GET /api/lambda/functions` - List all Lambda functions
- `POST /api/lambda/functions` - Create new Lambda function
- `DELETE /api/lambda/functions/{function_name}` - Delete function
- `POST /api/lambda/functions/{function_name}/invoke` - Invoke function
- `GET /api/lambda/functions/{function_name}` - Get function details

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  React Frontend │    │ FastAPI Backend │    │   AWS Services  │
│                 │    │                 │    │                 │
│  - Dashboard    │◄──►│  - REST API     │◄──►│  - EC2          │
│  - EC2 Page     │    │  - AWS Client   │    │  - S3           │
│  - S3 Page      │    │  - Services     │    │  - RDS          │
│  - RDS Page     │    │  - Models       │    │  - Lambda       │
│  - Lambda Page  │    │  - Routers      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Security Considerations

1. **AWS Credentials**: Store AWS credentials securely using environment variables
2. **CORS**: Configure CORS properly for production deployment
3. **Input Validation**: All API inputs are validated using Pydantic models
4. **Error Handling**: Comprehensive error handling with proper status codes
5. **Rate Limiting**: Consider implementing rate limiting for production use

## Development

### Backend Structure
```
backend/
├── main.py                 # FastAPI application entry point
├── requirements.txt        # Python dependencies
├── .env.example           # Environment variables template
├── app/
│   ├── __init__.py
│   ├── aws_client.py      # AWS client configuration
│   ├── models/
│   │   ├── __init__.py
│   │   └── aws_models.py  # Pydantic models
│   ├── services/
│   │   ├── __init__.py
│   │   ├── ec2_service.py
│   │   ├── s3_service.py
│   │   ├── rds_service.py
│   │   └── lambda_service.py
│   └── routers/
│       ├── __init__.py
│       ├── ec2.py
│       ├── s3.py
│       ├── rds.py
│       └── lambda_func.py
```

### Frontend Structure
```
frontend/
├── package.json           # npm dependencies
├── public/
│   └── index.html
└── src/
    ├── index.js          # React entry point
    ├── App.js            # Main application component
    ├── App.css           # Global styles
    ├── services/
    │   └── api.js        # API service functions
    └── pages/
        ├── Dashboard.js
        ├── EC2Page.js
        ├── S3Page.js
        ├── RDSPage.js
        └── LambdaPage.js
```

## Troubleshooting

### Common Issues

1. **AWS Credentials Error**: Ensure your AWS credentials are correctly configured in the `.env` file
2. **CORS Error**: Check that the backend is running on port 8000 and frontend on port 3000
3. **Module Import Error**: Ensure all Python dependencies are installed and virtual environment is activated
4. **Resource Creation Fails**: Check AWS permissions and account limits

### Logs

- Backend logs: Check the terminal where you started the FastAPI server
- Frontend logs: Check the browser developer console
- AWS API errors: Check the response details in the network tab

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review AWS service documentation
3. Check the API documentation at `http://localhost:8000/docs`
