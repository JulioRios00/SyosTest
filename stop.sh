#!/bin/bash
# SYOS - System Shutdown Script

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   SYOS - Sensor Monitoring System - Shutdown              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Stop API Principal
echo -e "${YELLOW}🛑 Stopping API Principal...${NC}"
if [ -f /tmp/syos-api.pid ]; then
    API_PID=$(cat /tmp/syos-api.pid)
    kill $API_PID 2>/dev/null || true
    rm /tmp/syos-api.pid
    echo -e "${GREEN}✓ API stopped${NC}"
else
    echo -e "${YELLOW}⚠ API PID file not found${NC}"
fi

# Stop Docker containers
echo -e "${YELLOW}🛑 Stopping Docker containers...${NC}"
docker stop syos-postgres syos-rabbitmq 2>/dev/null || true
docker rm syos-postgres syos-rabbitmq 2>/dev/null || true
echo -e "${GREEN}✓ Containers stopped${NC}"

echo ""
echo -e "${GREEN}All services stopped successfully!${NC}"
echo ""
