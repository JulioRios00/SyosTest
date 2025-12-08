#!/bin/bash
# Docker Compose deployment helper script

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "🚀 SYOS Sensor Monitoring System - Docker Deployment"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${YELLOW}🔍 Checking prerequisites...${NC}"

if ! command_exists docker; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

if ! command_exists docker-compose; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Prerequisites met${NC}"
echo ""

# Parse command line arguments
COMMAND=${1:-up}

case $COMMAND in
    up|start)
        echo -e "${YELLOW}🏗️  Building and starting services...${NC}"
        docker-compose up -d --build
        
        echo ""
        echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
        sleep 10
        
        # Check service health
        if docker-compose ps | grep -q "Up"; then
            echo -e "${GREEN}✓ Services are running${NC}"
            echo ""
            echo "═══════════════════════════════════════════════════════════"
            echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
            echo "═══════════════════════════════════════════════════════════"
            echo ""
            echo "📊 Service URLs:"
            echo "  Dashboard:    http://localhost:3000/dashboard"
            echo "  API:          http://localhost:3000/api/sensors"
            echo "  RabbitMQ:     http://localhost:15672 (admin/admin123)"
            echo ""
            echo "🔧 Useful commands:"
            echo "  View logs:        docker-compose logs -f"
            echo "  View API logs:    docker-compose logs -f api-principal"
            echo "  Stop services:    ./deploy-docker.sh stop"
            echo "  Restart:          ./deploy-docker.sh restart"
            echo ""
            echo "📝 Create a test sensor:"
            echo "  curl -X POST http://localhost:3000/api/sensors \\"
            echo "    -H 'Content-Type: application/json' \\"
            echo "    -d '{\"name\":\"Test Sensor\",\"location\":\"Lab\",\"minTemperature\":20,\"maxTemperature\":25,\"minHumidity\":40,\"maxHumidity\":60}'"
            echo ""
        else
            echo -e "${RED}❌ Some services failed to start${NC}"
            echo "Check logs with: docker-compose logs"
            exit 1
        fi
        ;;
        
    stop)
        echo -e "${YELLOW}🛑 Stopping services...${NC}"
        docker-compose down
        echo -e "${GREEN}✓ Services stopped${NC}"
        ;;
        
    restart)
        echo -e "${YELLOW}🔄 Restarting services...${NC}"
        docker-compose restart
        echo -e "${GREEN}✓ Services restarted${NC}"
        ;;
        
    logs)
        SERVICE=${2:-}
        if [ -z "$SERVICE" ]; then
            docker-compose logs -f
        else
            docker-compose logs -f "$SERVICE"
        fi
        ;;
        
    clean)
        echo -e "${YELLOW}🧹 Cleaning up (removing volumes)...${NC}"
        docker-compose down -v
        echo -e "${GREEN}✓ Cleanup completed${NC}"
        ;;
        
    status)
        echo "📊 Service Status:"
        docker-compose ps
        ;;
        
    *)
        echo "Usage: $0 {up|stop|restart|logs|clean|status}"
        echo ""
        echo "Commands:"
        echo "  up/start  - Build and start all services"
        echo "  stop      - Stop all services"
        echo "  restart   - Restart all services"
        echo "  logs      - View logs (optional: specify service name)"
        echo "  clean     - Stop and remove volumes"
        echo "  status    - Show service status"
        exit 1
        ;;
esac
