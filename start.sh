#!/bin/bash
# SYOS - Complete System Startup Script

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   SYOS - Sensor Monitoring System - Complete Startup      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${YELLOW}📋 Checking prerequisites...${NC}"
if ! command_exists docker; then
    echo -e "${RED}✗ Docker is not installed${NC}"
    exit 1
fi
if ! command_exists node; then
    echo -e "${RED}✗ Node.js is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ All prerequisites met${NC}"
echo ""

# Step 1: Stop any running containers
echo -e "${YELLOW}🛑 Stopping any running containers...${NC}"
docker stop syos-postgres syos-rabbitmq 2>/dev/null || true
docker rm syos-postgres syos-rabbitmq 2>/dev/null || true
echo -e "${GREEN}✓ Cleanup complete${NC}"
echo ""

# Step 2: Start PostgreSQL
echo -e "${YELLOW}🐘 Starting PostgreSQL database...${NC}"
docker run -d \
    --name syos-postgres \
    -e POSTGRES_PASSWORD=syos123 \
    -e POSTGRES_DB=syos \
    -p 5432:5432 \
    postgres:16 >/dev/null
echo "Waiting for PostgreSQL to be ready..."
sleep 5
echo -e "${GREEN}✓ PostgreSQL started${NC}"
echo ""

# Step 3: Create database tables
echo -e "${YELLOW}📊 Creating database tables...${NC}"
docker exec syos-postgres psql -U postgres -d syos -c "
CREATE TABLE IF NOT EXISTS sensors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    min_temperature DECIMAL(5,2) NOT NULL,
    max_temperature DECIMAL(5,2) NOT NULL,
    min_humidity DECIMAL(5,2) NOT NULL,
    max_humidity DECIMAL(5,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sensor_id UUID REFERENCES sensors(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    temperature DECIMAL(5,2),
    humidity DECIMAL(5,2),
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_alerts_sensor_id ON alerts(sensor_id);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at DESC);
" >/dev/null
echo -e "${GREEN}✓ Database tables created${NC}"
echo ""

# Step 4: Insert sample data
echo -e "${YELLOW}📝 Inserting sample sensor data...${NC}"
docker exec syos-postgres psql -U postgres -d syos -c "
INSERT INTO sensors (name, location, min_temperature, max_temperature, min_humidity, max_humidity, is_active) VALUES
('Sensor-01', 'Server Room A', 18.0, 24.0, 40.0, 60.0, true),
('Sensor-02', 'Server Room B', 18.0, 24.0, 40.0, 60.0, true),
('Sensor-03', 'Data Center Floor 1', 16.0, 22.0, 35.0, 55.0, true),
('Sensor-04', 'Storage Area', 15.0, 25.0, 30.0, 70.0, false),
('Sensor-05', 'Network Room', 18.0, 23.0, 40.0, 60.0, true)
ON CONFLICT DO NOTHING;

INSERT INTO alerts (sensor_id, type, severity, temperature, humidity, message)
SELECT 
    s.id,
    (ARRAY['TEMPERATURE', 'HUMIDITY'])[floor(random() * 2 + 1)],
    (ARRAY['WARNING', 'CRITICAL'])[floor(random() * 2 + 1)],
    20.0 + (random() * 10),
    45.0 + (random() * 20),
    'Threshold exceeded for sensor ' || s.name
FROM sensors s
WHERE s.is_active = true
LIMIT 8
ON CONFLICT DO NOTHING;
" >/dev/null 2>&1 || true
echo -e "${GREEN}✓ Sample data inserted${NC}"
echo ""

# Step 5: Start RabbitMQ
echo -e "${YELLOW}🐰 Starting RabbitMQ message broker...${NC}"
docker run -d \
    --name syos-rabbitmq \
    -e RABBITMQ_DEFAULT_USER=admin \
    -e RABBITMQ_DEFAULT_PASS=admin123 \
    -p 5672:5672 \
    -p 15672:15672 \
    rabbitmq:3-management >/dev/null
echo "Waiting for RabbitMQ to be ready..."
sleep 8
echo -e "${GREEN}✓ RabbitMQ started${NC}"
echo ""

# Step 6: Install dependencies
echo -e "${YELLOW}📦 Installing Node.js dependencies...${NC}"
cd api-principal
if [ ! -d "node_modules" ]; then
    npm install --silent
fi
cd ..
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Step 7: Start API Principal
echo -e "${YELLOW}🚀 Starting API Principal service...${NC}"
cd api-principal
npm run dev > /tmp/syos-api.log 2>&1 &
API_PID=$!
echo $API_PID > /tmp/syos-api.pid
cd ..
echo "Waiting for API to be ready..."
sleep 5

# Check if API is running
if curl -s http://localhost:3000/health >/dev/null 2>&1; then
    echo -e "${GREEN}✓ API Principal started (PID: $API_PID)${NC}"
else
    echo -e "${RED}✗ API failed to start. Check /tmp/syos-api.log for details${NC}"
fi
echo ""

# Summary
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    System is Ready! 🎉                     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Services Running:${NC}"
echo -e "  📊 Dashboard:      ${BLUE}http://localhost:3000/dashboard${NC}"
echo -e "  🔌 API:            ${BLUE}http://localhost:3000/api/sensors${NC}"
echo -e "  🐘 PostgreSQL:     ${BLUE}localhost:5432${NC}"
echo -e "  🐰 RabbitMQ UI:    ${BLUE}http://localhost:15672${NC} (admin/admin123)"
echo ""
echo -e "${YELLOW}Useful Commands:${NC}"
echo -e "  View API logs:     tail -f /tmp/syos-api.log"
echo -e "  Stop services:     ./stop.sh"
echo -e "  Restart API:       kill \$(cat /tmp/syos-api.pid) && cd api-principal && npm run dev &"
echo ""
echo -e "${GREEN}Sample API Commands:${NC}"
echo -e "  Register sensor:   curl -X POST http://localhost:3000/api/sensors -H 'Content-Type: application/json' -d '{\"name\":\"Sensor-06\",\"location\":\"Cooling Tower\",\"minTemperature\":10,\"maxTemperature\":20,\"minHumidity\":30,\"maxHumidity\":50}'"
echo -e "  Get all sensors:   curl http://localhost:3000/api/sensors"
echo -e "  Dashboard data:    curl http://localhost:3000/api/dashboard"
echo ""
