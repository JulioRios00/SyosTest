#!/bin/bash

# Run all tests for SYOS project
# This script runs tests for all three microservices

set -e

echo "🧪 Running SYOS Test Suite"
echo "=========================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to run tests for a service
run_service_tests() {
    local service=$1
    local coverage=$2
    
    echo -e "${YELLOW}Testing ${service}...${NC}"
    cd "$service"
    
    if [ "$coverage" = "coverage" ]; then
        npm run test:coverage
    else
        npm test
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ ${service} tests passed${NC}"
    else
        echo -e "${RED}✗ ${service} tests failed${NC}"
        exit 1
    fi
    
    cd ..
    echo ""
}

# Check if coverage flag is passed
COVERAGE=""
if [ "$1" = "--coverage" ] || [ "$1" = "-c" ]; then
    COVERAGE="coverage"
    echo "Running tests with coverage..."
    echo ""
fi

# Run tests for each service
run_service_tests "api-principal" "$COVERAGE"
run_service_tests "sensor-service" "$COVERAGE"
run_service_tests "notification-service" "$COVERAGE"

echo "=========================="
echo -e "${GREEN}✓ All tests passed successfully!${NC}"
echo ""

# Summary
echo "📊 Test Summary"
echo "=========================="
echo "✓ API Principal: Domain, Application, and Adapter tests"
echo "✓ Sensor Service: Use case tests"
echo "✓ Notification Service: Alert processing tests"
echo ""
echo "Total: 100+ tests across all services"
