#!/bin/bash

# AWS Deployment Script for Sales Scorecard
# This script deploys the application to AWS using Terraform and ECS

set -e

echo "🚀 Starting AWS deployment for Sales Scorecard..."

# Configuration
AWS_REGION=${AWS_REGION:-us-east-1}
ENVIRONMENT=${ENVIRONMENT:-development}
PROJECT_NAME="sales-scorecard"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi
    
    if ! command -v terraform &> /dev/null; then
        log_error "Terraform is not installed. Please install it first."
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install it first."
        exit 1
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        log_error "AWS credentials not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    log_success "All prerequisites met!"
}

# Build and push Docker image
build_and_push_image() {
    log_info "Building and pushing Docker image..."
    
    # Get AWS account ID
    AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
    ECR_REPOSITORY="${PROJECT_NAME}-repo"
    IMAGE_TAG="latest"
    
    # Login to ECR
    log_info "Logging in to ECR..."
    aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}
    
    # Build image
    log_info "Building Docker image..."
    cd sales-scorecard-api
    docker build -t ${PROJECT_NAME} .
    
    # Tag image
    docker tag ${PROJECT_NAME}:latest ${ECR_REGISTRY}/${ECR_REPOSITORY}:${IMAGE_TAG}
    
    # Push image
    log_info "Pushing image to ECR..."
    docker push ${ECR_REGISTRY}/${ECR_REPOSITORY}:${IMAGE_TAG}
    
    cd ..
    log_success "Docker image built and pushed successfully!"
}

# Deploy infrastructure with Terraform
deploy_infrastructure() {
    log_info "Deploying infrastructure with Terraform..."
    
    cd terraform
    
    # Initialize Terraform
    log_info "Initializing Terraform..."
    terraform init
    
    # Plan deployment
    log_info "Planning Terraform deployment..."
    terraform plan \
        -var="aws_region=${AWS_REGION}" \
        -var="environment=${ENVIRONMENT}" \
        -var="db_password=${DB_PASSWORD}" \
        -var="jwt_secret=${JWT_SECRET}" \
        -var="smtp_password=${SMTP_PASSWORD}" \
        -out=tfplan
    
    # Apply deployment
    log_info "Applying Terraform deployment..."
    terraform apply tfplan
    
    # Get outputs
    log_info "Getting Terraform outputs..."
    terraform output -json > ../terraform-outputs.json
    
    cd ..
    log_success "Infrastructure deployed successfully!"
}

# Update ECS service
update_ecs_service() {
    log_info "Updating ECS service..."
    
    # Get cluster and service names from Terraform outputs
    CLUSTER_NAME=$(jq -r '.ecs_cluster_name.value' terraform-outputs.json)
    SERVICE_NAME=$(jq -r '.ecs_service_name.value' terraform-outputs.json)
    
    # Force new deployment
    aws ecs update-service \
        --cluster ${CLUSTER_NAME} \
        --service ${SERVICE_NAME} \
        --force-new-deployment \
        --region ${AWS_REGION}
    
    log_success "ECS service updated successfully!"
}

# Wait for deployment to complete
wait_for_deployment() {
    log_info "Waiting for deployment to complete..."
    
    CLUSTER_NAME=$(jq -r '.ecs_cluster_name.value' terraform-outputs.json)
    SERVICE_NAME=$(jq -r '.ecs_service_name.value' terraform-outputs.json)
    
    aws ecs wait services-stable \
        --cluster ${CLUSTER_NAME} \
        --services ${SERVICE_NAME} \
        --region ${AWS_REGION}
    
    log_success "Deployment completed successfully!"
}

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."
    
    # Get database endpoint from Terraform outputs
    DB_ENDPOINT=$(jq -r '.database_endpoint.value' terraform-outputs.json)
    DB_URL="postgresql://postgres:${DB_PASSWORD}@${DB_ENDPOINT}/sales_scorecard"
    
    # Run migrations using a temporary ECS task
    CLUSTER_NAME=$(jq -r '.ecs_cluster_name.value' terraform-outputs.json)
    TASK_DEFINITION=$(jq -r '.ecs_task_definition.value' terraform-outputs.json)
    
    # Create migration task
    aws ecs run-task \
        --cluster ${CLUSTER_NAME} \
        --task-definition ${TASK_DEFINITION} \
        --overrides '{
            "containerOverrides": [{
                "name": "'${PROJECT_NAME}'-container",
                "command": ["npx", "prisma", "migrate", "deploy"]
            }]
        }' \
        --region ${AWS_REGION}
    
    log_success "Database migrations completed!"
}

# Main deployment function
main() {
    log_info "Starting AWS deployment for Sales Scorecard..."
    log_info "Environment: ${ENVIRONMENT}"
    log_info "AWS Region: ${AWS_REGION}"
    
    # Check if required environment variables are set
    if [ -z "$DB_PASSWORD" ]; then
        log_error "DB_PASSWORD environment variable is required"
        exit 1
    fi
    
    if [ -z "$JWT_SECRET" ]; then
        log_error "JWT_SECRET environment variable is required"
        exit 1
    fi
    
    if [ -z "$SMTP_PASSWORD" ]; then
        log_error "SMTP_PASSWORD environment variable is required"
        exit 1
    fi
    
    # Run deployment steps
    check_prerequisites
    build_and_push_image
    deploy_infrastructure
    run_migrations
    update_ecs_service
    wait_for_deployment
    
    # Get application URL
    APP_URL=$(jq -r '.application_url.value' terraform-outputs.json)
    
    log_success "🎉 Deployment completed successfully!"
    log_info "Application URL: ${APP_URL}"
    log_info "Admin Panel: ${APP_URL}/public-admin/panel"
    log_info "API Documentation: ${APP_URL}/api/docs"
    
    # Clean up
    rm -f terraform-outputs.json
}

# Run main function
main "$@"
