# AWS Resource Monitor & Deployment Platform

A comprehensive web application for monitoring AWS resources and deploying GitHub repositories to AWS services. Built with Python FastAPI backend and React frontend.

## ✨ Features

### 🔍 **AWS Resource Monitoring**
- **Multi-Region Support**: Monitor resources across all AWS regions
- **Real-time Data**: Live status and metrics for your AWS resources
- **Resource Management**: View, create, and manage AWS resources from the UI
- **Smart Filtering**: Search and filter resources by region, status, and tags

### 🚀 **GitHub Integration & Deployment**
- **Repository Connection**: Connect your GitHub repositories with personal access tokens
- **Multi-Service Deployment**: Deploy to Lambda, S3 Static Sites, EC2, and ECS
- **Automated Deployments**: Set up webhooks for automatic deployments on push
- **Environment Management**: Support for dev, staging, and production environments
- **Deployment Monitoring**: Real-time logs and status tracking

### 📊 **Enhanced UI/UX**
- **Intuitive Interface**: Clean, modern design with responsive layout
- **Interactive Components**: Advanced search, filtering, and sorting capabilities
- **Real-time Updates**: Live status updates and notifications
- **Region Selector**: Easy switching between AWS regions

## 🏗️ **Supported AWS Services**

### Resource Monitoring
- **EC2**: Instances, AMIs, Security Groups, Key Pairs
- **S3**: Buckets, Objects, Bucket policies
- **RDS**: Database instances, Snapshots, Parameter groups
- **Lambda**: Functions, Layers, Event source mappings

### Deployment Targets
- **AWS Lambda**: Serverless functions (Python, Node.js, Java, .NET, Go)
- **S3 Static Websites**: Static sites with automatic hosting setup
- **EC2 Instances**: Application deployment (coming soon)
- **ECS Containers**: Containerized applications (coming soon)

## 🛠️ **Tech Stack**

### Backend
- **FastAPI**: Modern Python web framework
- **Boto3**: Official AWS SDK for Python
- **Pydantic**: Data validation and serialization
- **Uvicorn**: ASGI server

### Frontend
- **React 18**: Modern JavaScript library
- **React Router**: Client-side routing
- **Axios**: HTTP client for API calls
- **React Toastify**: Elegant notifications
- **Tailwind CSS**: Utility-first CSS framework

## 📋 **Prerequisites**

- **Python 3.9+**
- **Node.js 16+**
- **AWS Account** with configured credentials
- **GitHub Account** for repository integration

## 🚀 **Quick Start**

### 1. Clone the Repository
```bash
git clone <repository-url>
cd aws-resource-deploy
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Configure AWS Credentials
```bash
# Option 1: AWS CLI
aws configure

# Option 2: Environment Variables
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_DEFAULT_REGION=us-east-1

# Option 3: Create .env file
echo "AWS_ACCESS_KEY_ID=your_access_key" > .env
echo "AWS_SECRET_ACCESS_KEY=your_secret_key" >> .env
echo "AWS_DEFAULT_REGION=us-east-1" >> .env
```

### 4. Start Backend Server
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 5. Frontend Setup
```bash
cd ../frontend
npm install
npm start
```

### 6. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🔧 **Configuration**

### AWS Permissions
Ensure your AWS credentials have the following permissions:
- **EC2**: `ec2:Describe*`, `ec2:RunInstances`, `ec2:TerminateInstances`
- **S3**: `s3:ListBucket`, `s3:GetObject`, `s3:PutObject`, `s3:CreateBucket`
- **RDS**: `rds:Describe*`, `rds:CreateDBInstance`
- **Lambda**: `lambda:*`, `iam:PassRole`

### GitHub Integration
1. Generate a GitHub Personal Access Token:
   - Go to GitHub Settings → Developer settings → Personal access tokens
   - Create token with `repo` and `user` scopes
2. Use the token in the GitHub Deploy page

## 📖 **Usage**

### Monitoring AWS Resources
1. **Dashboard**: Overview of all resources across regions
2. **Service Pages**: Detailed views for EC2, S3, RDS, Lambda
3. **Region Filtering**: Switch between AWS regions
4. **Resource Actions**: Create, delete, and manage resources

### Deploying from GitHub
1. **Connect Repository**: Enter GitHub token and select repository
2. **Configure Deployment**: Choose AWS service, environment, and region
3. **Deploy**: Monitor deployment progress and logs
4. **Automated Deployments**: Set up webhooks for automatic deployments

### Example Deployments

#### Lambda Function
```python
# lambda_function.py
def handler(event, context):
    return {
        'statusCode': 200,
        'body': 'Hello from Lambda!'
    }
```

#### Static Website
```html
<!-- index.html -->
<!DOCTYPE html>
<html>
<head><title>My Site</title></head>
<body><h1>Hello World!</h1></body>
</html>
```

## 🔧 **Development**

### Project Structure
```
aws-resource-deploy/
├── backend/
│   ├── app/
│   │   ├── models/          # Pydantic models
│   │   ├── routers/         # API route handlers
│   │   ├── services/        # Business logic
│   │   └── aws_client.py    # AWS client management
│   ├── main.py              # FastAPI application
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service layer
│   │   └── App.js          # Main application
│   └── package.json
└── README.md
```

### API Endpoints
- **GET /api/ec2/instances**: List EC2 instances
- **GET /api/s3/buckets**: List S3 buckets
- **POST /api/github/repositories**: Connect GitHub repository
- **POST /api/github/deploy**: Create deployment
- **GET /api/github/deployments**: List deployments

### Adding New Features
1. **Backend**: Add new router in `app/routers/`
2. **Models**: Define data models in `app/models/`
3. **Services**: Implement business logic in `app/services/`
4. **Frontend**: Create components in `src/components/` or `src/pages/`

## 🔐 **Security**

### Best Practices
- **AWS Credentials**: Never commit credentials to version control
- **GitHub Tokens**: Store securely and rotate regularly
- **IAM Roles**: Use least-privilege principles
- **Webhook Secrets**: Always use webhook secrets for automation

### Production Deployment
- Use environment variables for sensitive data
- Set up proper IAM roles for Lambda functions
- Enable CloudTrail for audit logging
- Use HTTPS for all communications

## 📚 **Documentation**

- **[Deployment Guide](DEPLOYMENT_GUIDE.md)**: Detailed guide for GitHub integration and AWS deployments
- **[API Documentation](http://localhost:8000/docs)**: Interactive API documentation
- **AWS Documentation**: [AWS SDK for Python](https://boto3.amazonaws.com/v1/documentation/api/latest/index.html)

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and add tests
4. Commit your changes: `git commit -am 'Add new feature'`
5. Push to the branch: `git push origin feature/new-feature`
6. Submit a pull request

## 📝 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support**

- **Issues**: Report bugs and request features on GitHub Issues
- **Discussions**: Ask questions in GitHub Discussions
- **Documentation**: Check the [Deployment Guide](DEPLOYMENT_GUIDE.md) for detailed instructions

## 🗺️ **Roadmap**

### Current Features ✅
- ✅ Multi-region AWS resource monitoring
- ✅ GitHub repository integration
- ✅ Lambda and S3 static deployments
- ✅ Real-time deployment monitoring
- ✅ Enhanced UI with search and filtering

### Upcoming Features 🚧
- 🚧 EC2 and ECS deployment support
- 🚧 GitLab and Bitbucket integration
- 🚧 CI/CD pipeline templates
- 🚧 Cost monitoring and optimization
- 🚧 Multi-cloud support (Azure, GCP)

---

**Built with ❤️ for the AWS and DevOps community**
