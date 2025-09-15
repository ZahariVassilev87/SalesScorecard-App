#!/bin/bash

# Sales Scorecard Monitoring Setup Script
# This script sets up comprehensive monitoring for the infrastructure

set -e

echo "📊 Setting up Sales Scorecard monitoring..."

# Create CloudWatch Dashboard
echo "📈 Creating CloudWatch dashboard..."
aws cloudwatch put-dashboard --dashboard-name "SalesScorecard-Infrastructure" --dashboard-body '{
  "widgets": [
    {
      "type": "metric",
      "x": 0,
      "y": 0,
      "width": 12,
      "height": 6,
      "properties": {
        "metrics": [
          [ "AWS/ECS", "RunningCount", "ServiceName", "sales-scorecard-service", "ClusterName", "sales-scorecard-cluster" ],
          [ ".", "DesiredCount", ".", ".", ".", "." ]
        ],
        "view": "timeSeries",
        "stacked": false,
        "region": "eu-north-1",
        "title": "ECS Service Task Count",
        "period": 300
      }
    },
    {
      "type": "metric",
      "x": 12,
      "y": 0,
      "width": 12,
      "height": 6,
      "properties": {
        "metrics": [
          [ "AWS/ApplicationELB", "HealthyHostCount", "TargetGroup", "arn:aws:elasticloadbalancing:eu-north-1:221855463690:targetgroup/sales-scorecard-targets/08de804ec692dbf9" ],
          [ ".", "UnHealthyHostCount", ".", "." ]
        ],
        "view": "timeSeries",
        "stacked": false,
        "region": "eu-north-1",
        "title": "Load Balancer Target Health",
        "period": 300
      }
    },
    {
      "type": "metric",
      "x": 0,
      "y": 6,
      "width": 12,
      "height": 6,
      "properties": {
        "metrics": [
          [ "AWS/ApplicationELB", "RequestCount", "LoadBalancer", "app/sales-scorecard-alb/b3c3d238f826c716" ]
        ],
        "view": "timeSeries",
        "stacked": false,
        "region": "eu-north-1",
        "title": "API Request Count",
        "period": 300
      }
    },
    {
      "type": "metric",
      "x": 12,
      "y": 6,
      "width": 12,
      "height": 6,
      "properties": {
        "metrics": [
          [ "AWS/ApplicationELB", "TargetResponseTime", "LoadBalancer", "app/sales-scorecard-alb/b3c3d238f826c716" ]
        ],
        "view": "timeSeries",
        "stacked": false,
        "region": "eu-north-1",
        "title": "API Response Time",
        "period": 300
      }
    }
  ]
}'

echo "✅ CloudWatch dashboard created"

# Create additional alarms
echo "🚨 Creating additional monitoring alarms..."

# High response time alarm
aws cloudwatch put-metric-alarm \
  --alarm-name "SalesScorecard-High-Response-Time" \
  --alarm-description "Alert when API response time is high" \
  --metric-name TargetResponseTime \
  --namespace AWS/ApplicationELB \
  --statistic Average \
  --period 300 \
  --threshold 2 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=LoadBalancer,Value=app/sales-scorecard-alb/b3c3d238f826c716 \
  --evaluation-periods 2 \
  --alarm-actions arn:aws:sns:eu-north-1:221855463690:sales-scorecard-alerts

# High error rate alarm
aws cloudwatch put-metric-alarm \
  --alarm-name "SalesScorecard-High-Error-Rate" \
  --alarm-description "Alert when API error rate is high" \
  --metric-name HTTPCode_Target_5XX_Count \
  --namespace AWS/ApplicationELB \
  --statistic Sum \
  --period 300 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=LoadBalancer,Value=app/sales-scorecard-alb/b3c3d238f826c716 \
  --evaluation-periods 1 \
  --alarm-actions arn:aws:sns:eu-north-1:221855463690:sales-scorecard-alerts

echo "✅ Monitoring alarms created"

# Create log group if it doesn't exist
echo "📝 Setting up log retention..."
aws logs put-retention-policy \
  --log-group-name "/ecs/sales-scorecard" \
  --retention-in-days 30

echo "✅ Log retention policy set"

echo "📊 Monitoring setup completed!"
echo "🔍 View dashboard: https://eu-north-1.console.aws.amazon.com/cloudwatch/home?region=eu-north-1#dashboards:name=SalesScorecard-Infrastructure"
echo "📧 You should receive an email to confirm SNS subscription for alerts"
