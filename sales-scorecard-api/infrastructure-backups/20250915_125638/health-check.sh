#!/bin/bash

# Quick health check script
echo "🔍 Checking Sales Scorecard infrastructure health..."

echo "📊 ECS Service Status:"
aws ecs describe-services --cluster sales-scorecard-cluster --services sales-scorecard-service --query 'services[0].{Status:status,RunningCount:runningCount,DesiredCount:desiredCount}' --output table

echo "📊 Load Balancer Health:"
aws elbv2 describe-target-health --target-group-arn arn:aws:elasticloadbalancing:eu-north-1:221855463690:targetgroup/sales-scorecard-targets/08de804ec692dbf9 --query 'TargetHealthDescriptions[0].{Target:Target.Id,Health:TargetHealth.State}' --output table

echo "📊 API Health Check:"
curl -s http://api.instorm.io/health | jq '.' || echo "❌ API not responding"
