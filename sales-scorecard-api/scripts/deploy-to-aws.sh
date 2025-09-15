#!/bin/bash

# Sales Scorecard AWS Deployment Script
# This script handles the complete deployment process with safety checks

set -e

echo "🚀 Starting Sales Scorecard AWS Deployment..."

# Configuration
AWS_REGION="eu-north-1"
ECR_REPO="sales-scorecard-api"
CLUSTER_NAME="sales-scorecard-cluster"
SERVICE_NAME="sales-scorecard-service"
TASK_FAMILY="sales-scorecard-task"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    print_error "AWS CLI not configured. Please run 'aws configure' first."
    exit 1
fi

print_status "AWS CLI configured"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi

print_status "Docker is running"

# Build Docker image
echo "🔨 Building Docker image..."
docker build -f Dockerfile.permissions -t sales-scorecard:latest .
print_status "Docker image built"

# Tag image for ECR
ECR_URI="221855463690.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}"
docker tag sales-scorecard:latest "${ECR_URI}:latest"
print_status "Image tagged for ECR"

# Login to ECR
echo "🔐 Logging into ECR..."
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_URI}
print_status "Logged into ECR"

# Push image to ECR
echo "📤 Pushing image to ECR..."
docker push "${ECR_URI}:latest"
print_status "Image pushed to ECR"

# Check if ECS service exists
if aws ecs describe-services --cluster ${CLUSTER_NAME} --services ${SERVICE_NAME} > /dev/null 2>&1; then
    print_status "ECS service exists, updating..."
    
    # Update service to use new image
    aws ecs update-service --cluster ${CLUSTER_NAME} --service ${SERVICE_NAME} --force-new-deployment
    print_status "ECS service updated"
    
    # Wait for deployment to complete
    echo "⏳ Waiting for deployment to complete..."
    aws ecs wait services-stable --cluster ${CLUSTER_NAME} --services ${SERVICE_NAME}
    print_status "Deployment completed"
else
    print_warning "ECS service not found. Please run the infrastructure setup first."
    exit 1
fi

# Health check
echo "🔍 Performing health check..."
sleep 30  # Wait for service to be ready

if curl -s http://api.instorm.io/health > /dev/null; then
    print_status "Health check passed - API is responding"
else
    print_warning "Health check failed - API may not be ready yet"
fi

# Show service status
echo "📊 Current service status:"
aws ecs describe-services --cluster ${CLUSTER_NAME} --services ${SERVICE_NAME} --query 'services[0].{Status:status,RunningCount:runningCount,DesiredCount:desiredCount}' --output table

print_status "Deployment completed successfully!"
echo "🌐 API URL: http://api.instorm.io"
echo "📚 API Docs: http://api.instorm.io/api/docs"
