# AWS Migration Plan - Sales Scorecard

## 🎯 Migration Overview

This document outlines the complete migration from Railway (SQLite) to AWS (PostgreSQL) for the Sales Scorecard application.

## 📋 Infrastructure Components

### 1. Database Layer
- **RDS PostgreSQL** (Multi-AZ, automated backups)
- **Connection pooling** with PgBouncer
- **Read replicas** for analytics queries

### 2. Application Layer
- **ECS Fargate** for containerized NestJS API
- **Application Load Balancer** for high availability
- **Auto Scaling Groups** for traffic management

### 3. Storage Layer
- **S3** for file storage (reports, exports, uploads)
- **CloudFront CDN** for global content delivery
- **IAM policies** for secure access control

### 4. Email Service
- **SES** for reliable email delivery
- **Verified domains** and sender identities
- **Email templates** and tracking

### 5. Monitoring & Security
- **CloudWatch** for application monitoring
- **X-Ray** for distributed tracing
- **WAF** for security protection
- **Secrets Manager** for sensitive data

## 🚀 Migration Steps

### Phase 1: AWS Setup
1. Create AWS account and configure IAM
2. Set up AWS CLI and credentials
3. Create VPC and networking components
4. Set up security groups and NACLs

### Phase 2: Database Migration
1. Create RDS PostgreSQL instance
2. Set up database security and backups
3. Migrate data from SQLite to PostgreSQL
4. Update application connection strings

### Phase 3: Application Deployment
1. Create ECS cluster and task definitions
2. Set up Application Load Balancer
3. Deploy NestJS application
4. Configure auto scaling

### Phase 4: Supporting Services
1. Set up S3 buckets and CloudFront
2. Configure SES for email delivery
3. Set up CloudWatch monitoring
4. Configure secrets management

### Phase 5: Testing & Cutover
1. Test all functionality in AWS
2. Set up monitoring and alerts
3. Plan cutover strategy
4. Execute migration and DNS updates

## 💰 Cost Estimation

### Monthly Costs (Estimated)
- **RDS PostgreSQL (db.t3.micro)**: ~$15-20
- **ECS Fargate (0.25 vCPU, 0.5GB RAM)**: ~$10-15
- **Application Load Balancer**: ~$18
- **S3 Storage (1GB)**: ~$0.02
- **CloudFront (1GB transfer)**: ~$0.08
- **SES (1000 emails)**: ~$0.10

**Total Estimated Monthly Cost: ~$45-55**

## 🔧 Prerequisites

1. AWS Account with appropriate permissions
2. AWS CLI installed and configured
3. Docker installed (for containerization)
4. Domain name for SSL certificates

## 📁 Files to Create

1. `docker-compose.yml` - Local development
2. `Dockerfile` - Application containerization
3. `terraform/` - Infrastructure as Code
4. `scripts/migrate-data.sh` - Data migration script
5. `aws-config/` - AWS configuration files

## 🎯 Success Criteria

- [ ] Application running on AWS infrastructure
- [ ] PostgreSQL database with migrated data
- [ ] Email service working with SES
- [ ] File uploads working with S3
- [ ] Monitoring and logging configured
- [ ] SSL certificates and custom domain
- [ ] Performance equal or better than Railway
- [ ] Cost within budget expectations
