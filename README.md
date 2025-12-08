# SYOS - Sensor Monitoring System

Real-time temperature and humidity monitoring system with microservices architecture.

## Quick Start

**Run everything with one command:**
```bash
./start.sh
```

Then open **http://localhost:3000/dashboard**

**Stop all services:**
```bash
./stop.sh
```

## What This System Does

Monitors temperature and humidity from multiple sensors and generates alerts when readings exceed configured limits.

**Key Features:**
- REST API for sensor management
- Real-time dashboard with statistics
- Automated alert generation
- Message queue communication
- Containerized deployment

## System Components

**3 Microservices:**
1. **API Principal** - REST API and web dashboard (port 3000)
2. **Sensor Service** - Simulates data collection every 10 seconds
3. **Notification Service** - Processes and stores alerts

**Infrastructure:**
- PostgreSQL database (sensors and alerts)
- RabbitMQ message broker (async communication)
- Docker containers (all services)
- Kubernetes manifests (production deployment)

## Architecture

**Clean Architecture (Hexagonal Pattern):**
- Domain Layer: Business entities and rules
- Application Layer: Use cases and orchestration
- Infrastructure Layer: Database, message queue, logging
- Adapters Layer: HTTP controllers, consumers, schedulers

**Service Communication:**
```
Browser → API Principal → PostgreSQL
              ↓
          RabbitMQ → Sensor Service
              ↓
    Notification Service
```

## Technologies

**Backend:**
- Node.js 20.x with TypeScript
- Express (REST API)
- PostgreSQL (database)
- RabbitMQ (message broker)

**Frontend:**
- TinyBone (client-side framework)
- DustJS (templates)
- RequireJS (module loading)

**DevOps:**
- Docker & Docker Compose
- Kubernetes manifests
- Jest (100+ tests)

## Prerequisites

**Minimal Setup (using start.sh):**
- Docker
- Node.js 20+

**Manual Setup:**
- Docker
- Node.js 20+
- PostgreSQL 16
- RabbitMQ 3

## Getting Started

### Option 1: Automated Setup (Recommended)

```bash
# Start everything
./start.sh

# Access the dashboard
open http://localhost:3000/dashboard

# Stop everything
./stop.sh
```

**What start.sh does:**
- Starts PostgreSQL (Docker)
- Creates database tables
- Inserts sample data (5 sensors)
- Starts RabbitMQ (Docker)
- Installs npm dependencies
- Starts API on port 3000

### Option 2: Manual Setup

**1. Install dependencies:**
```bash
cd api-principal && npm install && cd ..
```

**2. Start infrastructure:**
```bash
docker run -d --name syos-postgres \
  -e POSTGRES_PASSWORD=syos123 \
  -e POSTGRES_DB=syos \
  -p 5432:5432 postgres:16

docker run -d --name syos-rabbitmq \
  -e RABBITMQ_DEFAULT_USER=admin \
  -e RABBITMQ_DEFAULT_PASS=admin123 \
  -p 5672:5672 -p 15672:15672 \
  rabbitmq:3-management
```

**3. Start API:**
```bash
cd api-principal
npm run dev
```

**4. Access:**
- Dashboard: http://localhost:3000/dashboard
- RabbitMQ UI: http://localhost:15672 (admin/admin123)

## 🐳 Docker Deployment

### 1. Build Docker Images

```bash
# Build all services
docker-compose build
```

### 2. Start All Services

```bash
# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f api-principal
```

### 3. Verify Services

```bash
# Check running containers
docker-compose ps

# Test API health
curl http://localhost:3000/health
## Docker Deployment

**Start all services:**
```bash
docker-compose up -d
```

**Check status:**
```bash
docker-compose ps
docker-compose logs -f api-principal
```

**Stop services:**
```bash
docker-compose down
```pply all manifests in order
kubectl apply -f k8s/00-namespace.yaml
kubectl apply -f k8s/01-configmap.yaml
kubectl apply -f k8s/02-secrets.yaml
kubectl apply -f k8s/03-postgres.yaml
kubectl apply -f k8s/04-rabbitmq.yaml

# Wait for databases to be ready
kubectl wait --for=condition=ready pod -l app=postgres -n syos-monitoring --timeout=300s
kubectl wait --for=condition=ready pod -l app=rabbitmq -n syos-monitoring --timeout=300s

# Deploy application services
kubectl apply -f k8s/05-api-principal.yaml
kubectl apply -f k8s/06-sensor-service.yaml
kubectl apply -f k8s/07-notification-service.yaml
kubectl apply -f k8s/08-ingress.yaml
## Kubernetes Deployment

**Build images:**
```bash
docker build -t syos-api-principal:latest ./api-principal
docker build -t syos-sensor-service:latest ./sensor-service
docker build -t syos-notification-service:latest ./notification-service
```

**Deploy (minikube):**
```bash
# Load images
minikube image load syos-api-principal:latest
minikube image load syos-sensor-service:latest
minikube image load syos-notification-service:latest

# Deploy all manifests
cd k8s && ./deploy.sh

# Access service
minikube service api-principal-service -n syos-monitoring
```

**Scale services:**
```bash
kubectl scale deployment/sensor-service --replicas=3 -n syos-monitoring
```

**Cleanup:**
```bash
kubectl delete namespace syos-monitoring
```
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Office Sensor",
    "location": "Building A - Floor 3",
    "limits": {
      "minTemperature": 18,
      "maxTemperature": 26,
      "minHumidity": 30,
      "maxHumidity": 70
    },
    "isActive": true,
    "createdAt": "2025-12-07T...",
    "updatedAt": "2025-12-07T..."
  }
```

#### 3. Get All Sensors
```http
GET /api/sensors
```

**Response:**
```json
{
  "success": true,
  "data": [...]
}
```

#### 4. Get Active Sensors
```http
GET /api/sensors/active
```

#### 5. Dashboard View
```http
## API Endpoints

**Base URL:** `http://localhost:3000`

### Register Sensor
```bash
POST /api/sensors

# Example
curl -X POST http://localhost:3000/api/sensors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Office Sensor",
    "location": "Building A",
    "minTemperature": 18,
    "maxTemperature": 26,
    "minHumidity": 30,
    "maxHumidity": 70
  }'
```

### Get All Sensors
```bash
GET /api/sensors
GET /api/sensors/active
```

### Dashboard Data
```bash
GET /api/dashboard    # JSON response
GET /dashboard        # HTML view
```

### Health Check
```bash
GET /health
``` ├── 07-notification-service.yaml
│   └── 08-ingress.yaml
│
├── docker-compose.yml             # Docker Compose configuration
└── README.md                      # This file
```

## 🔧 Troubleshooting

### Docker Issues

**Problem**: Containers fail to start
```bash
# Check logs
docker-compose logs

# Rebuild images
docker-compose build --no-cache
docker-compose up -d
```

**Problem**: Database connection errors
```bash
# Verify PostgreSQL is running
docker-compose ps postgres

# Check PostgreSQL logs
docker-compose logs postgres
```

**Problem**: RabbitMQ connection errors
```bash
# Verify RabbitMQ is running
docker-compose ps rabbitmq

# Access RabbitMQ management
open http://localhost:15672
```

### Kubernetes Issues

**Problem**: Pods not starting
```bash
# Describe pod for details
kubectl describe pod <pod-name> -n syos-monitoring

# Check events
kubectl get events -n syos-monitoring --sort-by='.lastTimestamp'
```

**Problem**: Image pull errors
```bash
# Verify images are loaded
docker images | grep syos

# Reload images
minikube image load syos-api-principal:latest
```

**Problem**: Database not ready
```bash
# Check StatefulSet status
kubectl get statefulsets -n syos-monitoring

# Check PVC status
kubectl get pvc -n syos-monitoring
```

### Application Issues

## Testing

**Run tests:**
```bash
cd api-principal && npm test
npm run test:coverage
```

**Test coverage:** 100+ tests across domain, application, and adapter layers.
# 3. Check dashboard
open http://localhost:3000/dashboard

# 4. Check alerts in notification service logs
docker-compose logs notification-service | grep ALERT
```

## 🎓 Key Concepts Demonstrated

1. **Hexagonal Architecture**: Clean separation of concerns
2. **IIFE Pattern**: Self-executing services
3. **Microservices**: Independent, scalable services
4. **Event-Driven**: Asynchronous communication via RabbitMQ
5. **Domain-Driven Design**: Rich domain models with business logic
6. **Dependency Injection**: Loose coupling between layers
7. **Non-Root Containers**: Security best practices
8. **High Availability**: Multiple replicas in Kubernetes
9. **Structured Logging**: Winston for observability
10. **Type Safety**: TypeScript for robust development

## 📄 License

This project is developed as a technical test for SYOS.

## 👤 Author

Developed using AI assistance (GitHub Copilot with Claude Sonnet 4.5)

---

**Note**: This is a technical test demonstrating microservices architecture, hexagonal architecture, and DevOps practices with Docker and Kubernetes.
## Project Structure

```
├── start.sh / stop.sh           # Quick start/stop scripts
├── docker-compose.yml           # Multi-container setup
│
├── api-principal/               # Main API service
│   ├── src/
│   │   ├── domain/             # Entities, value objects
│   │   ├── application/        # Use cases
│   │   ├── infrastructure/     # Database, config
│   │   └── adapters/           # HTTP controllers
│   ├── public/                 # Frontend assets
│   └── tests/                  # 100+ tests
│
├── sensor-service/             # Data collection (IIFE)
├── notification-service/       # Alert processing (IIFE)
│
├── k8s/                        # Kubernetes manifests
└── shared/tinybone/            # Client-side framework
```## Troubleshooting

**Dashboard not loading?**
```bash
# Check API logs
tail -f /tmp/syos-api.log

# Verify database
docker exec syos-postgres psql -U postgres -d syos -c "\dt"
```

**Containers not starting?**
```bash
docker-compose logs
docker-compose ps
```

**Port already in use?**
```bash
# Stop existing services
./stop.sh

# Check what's using port 3000
lsof -i :3000
```

## Key Features Demonstrated

- Clean Architecture (Hexagonal pattern)
- Microservices with message queue
- Event-driven design
- Docker containerization
- Kubernetes orchestration
- TypeScript with strict typing
- Comprehensive test coverage

## License

Technical test project for SYOS.

---

**For more details, see:**
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Detailed architecture documentation
- [API Principal README](./api-principal/README.md) - Service-specific documentation