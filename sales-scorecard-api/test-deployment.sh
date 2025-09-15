#!/bin/bash

# Sales Scorecard API - Deployment Testing Script
# Usage: ./test-deployment.sh https://your-app-name.railway.app

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if URL is provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: Please provide your Railway app URL${NC}"
    echo "Usage: ./test-deployment.sh https://your-app-name.railway.app"
    exit 1
fi

APP_URL="$1"
echo -e "${BLUE}🧪 Testing Sales Scorecard API Deployment${NC}"
echo -e "${BLUE}📍 URL: $APP_URL${NC}\n"

# Test 1: Health Check
echo -e "${YELLOW}1. Testing Health Endpoint...${NC}"
HEALTH_RESPONSE=$(curl -s -w "%{http_code}" "$APP_URL/health" -o /tmp/health_response.json)
HEALTH_CODE="${HEALTH_RESPONSE: -3}"

if [ "$HEALTH_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Health check passed (HTTP $HEALTH_CODE)${NC}"
    echo "Response:"
    cat /tmp/health_response.json | jq '.' 2>/dev/null || cat /tmp/health_response.json
else
    echo -e "${RED}❌ Health check failed (HTTP $HEALTH_CODE)${NC}"
    echo "Response:"
    cat /tmp/health_response.json
fi
echo ""

# Test 2: API Documentation
echo -e "${YELLOW}2. Testing API Documentation...${NC}"
DOCS_RESPONSE=$(curl -s -w "%{http_code}" "$APP_URL/api/docs" -o /tmp/docs_response.html)
DOCS_CODE="${DOCS_RESPONSE: -3}"

if [ "$DOCS_CODE" = "200" ]; then
    echo -e "${GREEN}✅ API documentation accessible (HTTP $DOCS_CODE)${NC}"
    echo "📚 Visit: $APP_URL/api/docs"
else
    echo -e "${RED}❌ API documentation not accessible (HTTP $DOCS_CODE)${NC}"
fi
echo ""

# Test 3: Protected Endpoint (should return 401)
echo -e "${YELLOW}3. Testing Protected Endpoint (should return 401)...${NC}"
PROTECTED_RESPONSE=$(curl -s -w "%{http_code}" "$APP_URL/users" -o /tmp/protected_response.json)
PROTECTED_CODE="${PROTECTED_RESPONSE: -3}"

if [ "$PROTECTED_CODE" = "401" ]; then
    echo -e "${GREEN}✅ Authentication working correctly (HTTP $PROTECTED_CODE)${NC}"
else
    echo -e "${RED}❌ Authentication issue (HTTP $PROTECTED_CODE)${NC}"
    echo "Response:"
    cat /tmp/protected_response.json
fi
echo ""

# Test 4: Admin System Info
echo -e "${YELLOW}4. Testing Admin System Info...${NC}"
ADMIN_RESPONSE=$(curl -s -w "%{http_code}" "$APP_URL/admin/system-info" -o /tmp/admin_response.json)
ADMIN_CODE="${ADMIN_RESPONSE: -3}"

if [ "$ADMIN_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Admin endpoint accessible (HTTP $ADMIN_CODE)${NC}"
    echo "Response:"
    cat /tmp/admin_response.json | jq '.' 2>/dev/null || cat /tmp/admin_response.json
else
    echo -e "${RED}❌ Admin endpoint failed (HTTP $ADMIN_CODE)${NC}"
    echo "Response:"
    cat /tmp/admin_response.json
fi
echo ""

# Test 5: Magic Link Endpoint (test with invalid email)
echo -e "${YELLOW}5. Testing Magic Link Endpoint...${NC}"
MAGIC_RESPONSE=$(curl -s -w "%{http_code}" -X POST "$APP_URL/auth/magic-link" \
    -H "Content-Type: application/json" \
    -d '{"email": "test@invalid-domain.com"}' \
    -o /tmp/magic_response.json)
MAGIC_CODE="${MAGIC_RESPONSE: -3}"

if [ "$MAGIC_CODE" = "400" ]; then
    echo -e "${GREEN}✅ Magic link endpoint working (HTTP $MAGIC_CODE - domain validation)${NC}"
elif [ "$MAGIC_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Magic link endpoint working (HTTP $MAGIC_CODE)${NC}"
else
    echo -e "${RED}❌ Magic link endpoint issue (HTTP $MAGIC_CODE)${NC}"
    echo "Response:"
    cat /tmp/magic_response.json
fi
echo ""

# Summary
echo -e "${BLUE}📊 Deployment Test Summary${NC}"
echo "================================"

# Count successful tests
SUCCESS_COUNT=0
TOTAL_TESTS=5

if [ "$HEALTH_CODE" = "200" ]; then ((SUCCESS_COUNT++)); fi
if [ "$DOCS_CODE" = "200" ]; then ((SUCCESS_COUNT++)); fi
if [ "$PROTECTED_CODE" = "401" ]; then ((SUCCESS_COUNT++)); fi
if [ "$ADMIN_CODE" = "200" ]; then ((SUCCESS_COUNT++)); fi
if [ "$MAGIC_CODE" = "200" ] || [ "$MAGIC_CODE" = "400" ]; then ((SUCCESS_COUNT++)); fi

echo -e "Tests Passed: ${GREEN}$SUCCESS_COUNT/$TOTAL_TESTS${NC}"

if [ "$SUCCESS_COUNT" -eq "$TOTAL_TESTS" ]; then
    echo -e "${GREEN}🎉 All tests passed! Your deployment is working correctly.${NC}"
    echo -e "${GREEN}🚀 Your Sales Scorecard API is ready for use!${NC}"
else
    echo -e "${YELLOW}⚠️  Some tests failed. Check the output above for details.${NC}"
    echo -e "${YELLOW}🔧 Review your environment variables and Railway logs.${NC}"
fi

echo ""
echo -e "${BLUE}📚 Next Steps:${NC}"
echo "1. Test with your iOS app"
echo "2. Set up proper email service"
echo "3. Configure your domain"
echo "4. Monitor Railway logs"

# Cleanup
rm -f /tmp/health_response.json /tmp/docs_response.html /tmp/protected_response.json /tmp/admin_response.json /tmp/magic_response.json
