# AWS Migration Guide - Sales Scorecard

## 🎯 Overview

This guide will help you migrate the Sales Scorecard application from Railway (SQLite) to AWS (PostgreSQL) for enterprise-grade production deployment.

## 📋 Prerequisites

### 1. AWS Account Setup
- AWS Account with appropriate permissions
- AWS CLI installed and configured
- IAM user with the following permissions:
  - EC2 (VPC, Security Groups, Load Balancers)
  - ECS (Clusters, Services, Task Definitions)
  - RDS (Database instances)
  - S3 (Bucket creation and management)
  - ECR (Container registry)
  - IAM (Role creation)
  - CloudWatch (Logging)
  - Secrets Manager
  - Route 53 (if using custom domain)

### 2. Local Tools
- **Terraform** (>= 1.0)
- **Docker** (for containerization)
- **AWS CLI** (configured with credentials)
- **PostgreSQL client** (for database operations)

### 3. Environment Variables
Set the following environment variables:
```bash
export AWS_REGION="us-east-1"
export ENVIRONMENT="production"  # or "development"
export DB_PASSWORD="your-secure-db-password"
export JWT_SECRET="your-super-secret-jwt-key"
export SMTP_PASSWORD="your-smtp-password"
```

## 🚀 Quick Start

### Step 1: Clone and Setup
```bash
cd /Users/zaharivassilev/SalesScorecard
```

### Step 2: Configure Environment
```bash
# Set your environment variables
export AWS_REGION="us-east-1"
export ENVIRONMENT="production"
export DB_PASSWORD="$(openssl rand -base64 32)"
export JWT_SECRET="$(openssl rand -base64 64)"
export SMTP_PASSWORD="your-smtp-password"
```

### Step 3: Deploy to AWS
```bash
# Run the deployment script
./scripts/deploy-aws.sh
```

## 📊 Infrastructure Components

### 🗄️ Database Layer
- **RDS PostgreSQL 15.4** (Multi-AZ for high availability)
- **Automated backups** (7-day retention)
- **Encrypted storage** with AWS KMS
- **Connection pooling** ready

### 🚀 Application Layer
- **ECS Fargate** for serverless container hosting
- **Application Load Balancer** for high availability
- **Auto Scaling** for traffic management
- **Health checks** and monitoring

### 📁 Storage Layer
- **S3** for file storage (reports, exports, uploads)
- **CloudFront CDN** for global content delivery
- **Versioning** and lifecycle policies

### 📧 Email Service
- **SES** for reliable email delivery
- **Verified domains** and sender identities
- **Email templates** and tracking

### 🔍 Monitoring & Security
- **CloudWatch** for application monitoring
- **X-Ray** for distributed tracing
- **WAF** for security protection
- **Secrets Manager** for sensitive data

## 🔧 Manual Deployment Steps

### 1. Build and Push Docker Image
```bash
cd sales-scorecard-api

# Build the image
docker build -t sales-scorecard .

# Tag for ECR
docker tag sales-scorecard:latest <account-id>.dkr.ecr.<region>.amazonaws.com/sales-scorecard-repo:latest

# Push to ECR
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/sales-scorecard-repo:latest
```

### 2. Deploy Infrastructure
```bash
cd terraform

# Initialize Terraform
terraform init

# Plan deployment
terraform plan -var="db_password=$DB_PASSWORD" -var="jwt_secret=$JWT_SECRET"

# Apply deployment
terraform apply
```

### 3. Run Database Migrations
```bash
# Get database endpoint from Terraform outputs
DB_ENDPOINT=$(terraform output -raw database_endpoint)

# Run migrations
DATABASE_URL="postgresql://postgres:$DB_PASSWORD@$DB_ENDPOINT/sales_scorecard" npx prisma migrate deploy
```

### 4. Migrate Data (if needed)
```bash
# Run the data migration script
./scripts/migrate-data.sh
```

## 📊 Cost Estimation

### Monthly Costs (Estimated)
- **RDS PostgreSQL (db.t3.micro)**: ~$15-20
- **ECS Fargate (0.25 vCPU, 0.5GB RAM)**: ~$10-15
- **Application Load Balancer**: ~$18
- **S3 Storage (1GB)**: ~$0.02
- **CloudFront (1GB transfer)**: ~$0.08
- **SES (1000 emails)**: ~$0.10

**Total Estimated Monthly Cost: ~$45-55**

## 🔧 Configuration

### Environment Variables
The application uses the following environment variables:

```bash
# Database
DATABASE_URL="postgresql://postgres:password@endpoint:5432/sales_scorecard"

# JWT
JWT_SECRET="your-jwt-secret"

# Email (SES)
SMTP_HOST="email-smtp.us-east-1.amazonaws.com"
SMTP_PORT="587"
SMTP_USER="your-ses-smtp-user"
SMTP_PASS="your-ses-smtp-password"
SMTP_FROM="noreply@yourdomain.com"

# S3
AWS_REGION="us-east-1"
S3_BUCKET="your-s3-bucket-name"

# Application
NODE_ENV="production"
PORT="3000"
```

### Custom Domain Setup
1. **Get SSL Certificate** from AWS Certificate Manager
2. **Update Route 53** DNS records
3. **Update Terraform** with certificate ARN
4. **Redeploy** infrastructure

## 🔍 Monitoring and Troubleshooting

### CloudWatch Logs
```bash
# View application logs
aws logs describe-log-groups --log-group-name-prefix "/ecs/sales-scorecard"

# Stream logs
aws logs tail /ecs/sales-scorecard --follow
```

### ECS Service Status
```bash
# Check service status
aws ecs describe-services --cluster sales-scorecard-cluster --services sales-scorecard-service

# Check task status
aws ecs list-tasks --cluster sales-scorecard-cluster --service-name sales-scorecard-service
```

### Database Connection
```bash
# Connect to database
psql "postgresql://postgres:password@endpoint:5432/sales_scorecard"
```

## 🚨 Troubleshooting

### Common Issues

1. **ECS Tasks Failing to Start**
   - Check CloudWatch logs
   - Verify environment variables
   - Check security group rules

2. **Database Connection Issues**
   - Verify security group allows port 5432
   - Check database endpoint and credentials
   - Ensure database is in available state

3. **Load Balancer Health Check Failures**
   - Verify application is listening on port 3000
   - Check health check path and configuration
   - Review security group rules

4. **S3 Access Issues**
   - Verify IAM role permissions
   - Check bucket policy
   - Ensure correct region configuration

## 🔄 Rollback Plan

### Rollback to Railway
1. **Update DNS** to point back to Railway
2. **Export data** from PostgreSQL
3. **Import data** back to SQLite
4. **Update application** configuration

### Rollback Infrastructure
```bash
cd terraform
terraform destroy
```

## 📞 Support

For issues or questions:
1. Check CloudWatch logs
2. Review Terraform state
3. Verify AWS service status
4. Check application health endpoints

## 🎯 Next Steps

After successful migration:
1. **Set up monitoring alerts**
2. **Configure backup policies**
3. **Set up CI/CD pipeline**
4. **Implement security best practices**
5. **Set up custom domain and SSL**
6. **Configure email templates**
7. **Set up file upload functionality**
