# GitHub Integration & AWS Deployment Guide

This document explains how to use the GitHub integration feature to automatically deploy your repositories to AWS services.

## Table of Contents
1. [Setup GitHub Integration](#setup-github-integration)
2. [Supported AWS Services](#supported-aws-services)
3. [Manual Deployment](#manual-deployment)
4. [Automated Deployment with Webhooks](#automated-deployment-with-webhooks)
5. [Deployment Configuration](#deployment-configuration)
6. [Troubleshooting](#troubleshooting)

## Setup GitHub Integration

### 1. Generate GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Click "Generate new token (classic)"
3. Select the following scopes:
   - `repo` (Full control of private repositories)
   - `read:user` (Read access to user profile)
   - `user:email` (Access to user email addresses)
4. Copy the generated token (starts with `ghp_`)

### 2. Connect Repository

1. Navigate to the GitHub Deploy page in the application
2. Paste your GitHub access token
3. Click "Connect to GitHub"
4. Select the repository you want to deploy

## Supported AWS Services

### AWS Lambda
- **Use Case**: Serverless functions and APIs
- **Supported Runtimes**: Python 3.9, Python 3.8, Node.js 16/14, Java 11/8, .NET 6, Go 1.x
- **Required Files**: Handler file (e.g., `index.js`, `lambda_function.py`)
- **Features**: Environment variables, auto-scaling

### S3 Static Website
- **Use Case**: Static websites (HTML, CSS, JavaScript)
- **Supported Files**: HTML, CSS, JavaScript, Images
- **Required Files**: `index.html`
- **Features**: Automatic bucket creation, public hosting setup

### EC2 (Coming Soon)
- **Use Case**: Full applications requiring virtual machines
- **Deployment Methods**: CodeDeploy, Docker, Direct upload
- **Features**: Auto-scaling, load balancer support

### ECS (Coming Soon)
- **Use Case**: Containerized applications
- **Required Files**: Dockerfile
- **Features**: Fargate and EC2 launch types

## Manual Deployment

### Step-by-Step Process

1. **Select Repository**: Choose from your connected GitHub repositories
2. **Configure Deployment**:
   - AWS Service (Lambda, S3 Static, etc.)
   - Environment (dev, staging, prod)
   - AWS Region
   - Runtime (for Lambda)
3. **Deploy**: Click "Deploy Selected" and monitor progress

### Example: Deploying a Python Lambda Function

```python
# lambda_function.py or index.py
def handler(event, context):
    return {
        'statusCode': 200,
        'body': 'Hello from Lambda!'
    }
```

**Deployment Configuration**:
- AWS Service: Lambda
- Runtime: Python 3.9
- Environment: dev
- Region: us-east-1

### Example: Deploying a Static Website

```html
<!-- index.html -->
<!DOCTYPE html>
<html>
<head>
    <title>My Website</title>
</head>
<body>
    <h1>Hello World!</h1>
</body>
</html>
```

**Deployment Configuration**:
- AWS Service: S3 Static Website
- Environment: prod
- Region: us-east-1

## Automated Deployment with Webhooks

### Setup Webhook

1. In your GitHub repository, go to Settings → Webhooks
2. Add webhook with URL: `https://your-domain.com/api/webhooks/github`
3. Content type: `application/json`
4. Secret: Set a secure secret (configure in backend)
5. Events: Select "Push" and "Pull requests"

### Auto-Deploy Configuration

The webhook handler supports:
- **Push Events**: Automatic deployment on push to configured branches
- **Pull Request Events**: Preview deployments for code reviews

### Environment-Based Deployment

```yaml
# Example auto-deploy configuration
branches:
  main:
    environment: prod
    aws_service: lambda
    region: us-east-1
  develop:
    environment: dev
    aws_service: lambda
    region: us-west-2
  feature/*:
    environment: preview
    aws_service: s3-static
    region: us-east-1
```

## Deployment Configuration

### Environment Variables

For Lambda deployments, you can set environment variables:

```json
{
  "environment_variables": {
    "DATABASE_URL": "your-database-url",
    "API_KEY": "your-api-key",
    "ENVIRONMENT": "production"
  }
}
```

### Deployment Environments

- **dev**: Development environment for testing
- **staging**: Pre-production environment
- **prod**: Production environment
- **preview**: Temporary environments for pull requests

### AWS Regions

Choose the appropriate region based on:
- **Latency**: Closest to your users
- **Compliance**: Data residency requirements
- **Cost**: Regional pricing differences
- **Services**: Feature availability

## Troubleshooting

### Common Issues

#### 1. Authentication Errors
- **Issue**: "Failed to fetch repositories"
- **Solution**: Verify GitHub token has correct permissions

#### 2. Lambda Deployment Failures
- **Issue**: "Failed to create Lambda function"
- **Solutions**:
  - Ensure proper IAM role exists
  - Check handler file exists
  - Verify runtime compatibility

#### 3. S3 Deployment Issues
- **Issue**: "Bucket already exists"
- **Solution**: Bucket names must be globally unique

#### 4. File Not Found Errors
- **Issue**: Missing required files
- **Solutions**:
  - Lambda: Ensure handler file exists
  - S3: Ensure index.html exists in root

### Viewing Deployment Logs

1. Go to the GitHub Deploy page
2. Find your deployment in the "Recent Deployments" section
3. Click "View Logs" to see detailed deployment information

### Manual Debugging

```bash
# Check Lambda function in AWS Console
aws lambda get-function --function-name my-function

# Check S3 bucket
aws s3 ls s3://my-bucket

# View CloudWatch logs
aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/"
```

## Best Practices

### Repository Structure

```
my-lambda-app/
├── lambda_function.py    # Main handler
├── requirements.txt      # Dependencies
├── README.md
└── tests/
    └── test_handler.py
```

```
my-static-site/
├── index.html           # Main page
├── css/
│   └── style.css
├── js/
│   └── script.js
└── images/
    └── logo.png
```

### Security

1. **Secrets Management**: Never commit access tokens or secrets
2. **IAM Roles**: Use least-privilege IAM roles for Lambda
3. **Environment Variables**: Store sensitive data in environment variables
4. **Webhook Security**: Always use webhook secrets

### Performance

1. **Lambda**: Minimize package size and cold starts
2. **S3**: Use CloudFront for global content delivery
3. **Monitoring**: Set up CloudWatch alarms
4. **Cost**: Monitor AWS usage and costs

## Advanced Features

### Multi-Environment Deployments

Configure different environments for the same repository:
- Feature branches → Preview environments
- Develop branch → Development environment
- Main branch → Production environment

### Rollback Strategy

1. **Lambda**: Use function versions and aliases
2. **S3**: Keep previous versions in version-controlled bucket
3. **Monitoring**: Set up alerts for deployment failures

### Integration with CI/CD

The webhook system can be extended to work with existing CI/CD pipelines:
1. GitHub Actions trigger webhook
2. Webhook validates and deploys to AWS
3. Notifications sent to Slack/email

## Support

For issues or questions:
1. Check the deployment logs first
2. Verify AWS credentials and permissions
3. Test with a simple repository structure
4. Contact support with specific error messages
