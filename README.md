# 🌡️ SYOS - Sensor Monitoring System

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-24.x-blue.svg)](https://www.docker.com/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-1.28+-blue.svg)](https://kubernetes.io/)

A distributed microservices application for real-time temperature and humidity monitoring using **Hexagonal Architecture**, built with Node.js, Express, RabbitMQ, PostgreSQL, and deployed with Docker & Kubernetes.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Technologies](#technologies)
- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Docker Deployment](#docker-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

This system monitors temperature and humidity from multiple sensors in real-time, generating alerts when readings exceed configured limits. The application demonstrates:

- **Microservices Architecture** with 3 independent services
- **Hexagonal Architecture** (Ports & Adapters pattern)
- **Asynchronous Communication** via RabbitMQ
- **Event-Driven Design** with message queues
- **Domain-Driven Design** principles
- **IIFE Pattern** for sensor and notification services
- **Docker Containerization** with non-root users
- **Kubernetes Orchestration** with high availability

### Microservices

1. **API Principal**: REST API and Dashboard (Express + DustJS)
2. **Sensor Service**: Simulates data collection (IIFE pattern)
3. **Notification Service**: Processes alerts (IIFE pattern)

## 🏗️ Architecture

### Hexagonal Architecture

The project follows Hexagonal Architecture (Ports & Adapters) to separate business logic from infrastructure concerns:

```
┌─────────────────────────────────────────────────────────┐
│                    ADAPTERS LAYER                        │
│  (HTTP Controllers, RabbitMQ Consumers, Schedulers)      │
└────────────────┬────────────────────────┬────────────────┘
                 │                        │
┌────────────────▼────────────────────────▼────────────────┐
│                  APPLICATION LAYER                        │
│            (Use Cases, DTOs, Orchestration)               │
└────────────────┬────────────────────────┬────────────────┘
                 │                        │
┌────────────────▼────────────────────────▼────────────────┐
│                    DOMAIN LAYER                           │
│  (Entities, Value Objects, Business Rules, Ports)         │
└───────────────────────────────────────────────────────────┘
                 ▲                        ▲
                 │                        │
┌────────────────┴────────────────────────┴────────────────┐
│                INFRASTRUCTURE LAYER                       │
│     (Database, RabbitMQ, Logger Implementations)          │
└───────────────────────────────────────────────────────────┘
```

### System Architecture

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│              │         │              │         │              │
│ API Principal│◄────────┤  PostgreSQL  ├────────►│   Sensor     │
│   (Express)  │         │  (Database)  │         │   Service    │
│              │         │              │         │   (IIFE)     │
└──────┬───────┘         └──────────────┘         └──────┬───────┘
       │                                                  │
       │                 ┌──────────────┐                │
       │                 │              │                │
       └────────────────►│  RabbitMQ    │◄───────────────┘
                         │  (Message    │
                         │   Queue)     │
                         └──────┬───────┘
                                │
                         ┌──────▼───────┐
                         │              │
                         │ Notification │
                         │   Service    │
                         │   (IIFE)     │
                         └──────────────┘
```

## 🛠️ Technologies

### Core Technologies
- **Node.js** (v20+) - Runtime environment
- **TypeScript** (v5.3+) - Type-safe development
- **Express** (v4.18) - Web framework
- **DustJS** (v2.7) - Template engine for dashboard
- **TinyBone** - Client-side dual rendering framework (in shared/tinybone)
- **node-postgres (pg)** - PostgreSQL database driver

### Infrastructure
- **PostgreSQL** (v16) - Relational database
- **RabbitMQ** (v3) - Message broker
- **Docker** (v24+) - Containerization
- **Kubernetes** (v1.28+) - Container orchestration

### Libraries
- **amqplib** - RabbitMQ client
- **Winston** - Structured logging
- **pg** - PostgreSQL driver

## 📦 Prerequisites

### For Local Development
- Node.js 20.x or higher
- PostgreSQL 16.x
- RabbitMQ 3.x
- npm or yarn

### For Docker Deployment
- Docker 24.x or higher
- Docker Compose 2.x or higher

### For Kubernetes Deployment
- kubectl configured
- Kubernetes cluster (minikube, k3s, or cloud provider)
- Docker for building images

## 🚀 Local Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Syos
```

### 2. Install Dependencies

```bash
# Install dependencies for all services
cd api-principal && npm install && cd ..
cd sensor-service && npm install && cd ..
cd notification-service && npm install && cd ..
```

### 3. Setup PostgreSQL

```bash
# Create database
createdb sensor_monitoring

# Or using psql
psql -U postgres
CREATE DATABASE sensor_monitoring;
\q
```

### 4. Setup RabbitMQ

```bash
# Using Docker
docker run -d --name rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  -e RABBITMQ_DEFAULT_USER=admin \
  -e RABBITMQ_DEFAULT_PASS=admin123 \
  rabbitmq:3-management-alpine
```

### 5. Configure Environment Variables

```bash
# Copy example env files
cp api-principal/.env.example api-principal/.env
cp sensor-service/.env.example sensor-service/.env
cp notification-service/.env.example notification-service/.env

# Edit .env files with your configuration
```

### 6. Build TypeScript

```bash
# Build all services
cd api-principal && npm run build && cd ..
cd sensor-service && npm run build && cd ..
cd notification-service && npm run build && cd ..
```

### 7. Start Services

```bash
# Terminal 1 - API Principal
cd api-principal
npm run dev

# Terminal 2 - Sensor Service
cd sensor-service
npm run dev

# Terminal 3 - Notification Service
cd notification-service
npm run dev
```

### 8. Access the Application

- **Dashboard**: http://localhost:3000/dashboard
- **API**: http://localhost:3000/api
- **RabbitMQ Management**: http://localhost:15672 (admin/admin123)

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
```

### 4. Create Test Sensors

```bash
# Register a sensor
curl -X POST http://localhost:3000/api/sensors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Server Room Sensor",
    "location": "Data Center - Room A",
    "minTemperature": 18,
    "maxTemperature": 24,
    "minHumidity": 40,
    "maxHumidity": 60
  }'
```

### 5. Access Dashboard

Open http://localhost:3000/dashboard in your browser.

### 6. Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## ☸️ Kubernetes Deployment

### 1. Build Docker Images

```bash
# Build images for Kubernetes
docker build -t syos-api-principal:latest ./api-principal
docker build -t syos-sensor-service:latest ./sensor-service
docker build -t syos-notification-service:latest ./notification-service
```

### 2. Load Images (For local Kubernetes)

```bash
# For minikube
minikube image load syos-api-principal:latest
minikube image load syos-sensor-service:latest
minikube image load syos-notification-service:latest

# For kind
kind load docker-image syos-api-principal:latest
kind load docker-image syos-sensor-service:latest
kind load docker-image syos-notification-service:latest
```

### 3. Deploy to Kubernetes

```bash
# Apply all manifests in order
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
```

### 4. Verify Deployment

```bash
# Check all pods
kubectl get pods -n syos-monitoring

# Check services
kubectl get services -n syos-monitoring

# View logs
kubectl logs -f deployment/api-principal -n syos-monitoring
kubectl logs -f deployment/sensor-service -n syos-monitoring
kubectl logs -f deployment/notification-service -n syos-monitoring
```

### 5. Access the Application

```bash
# Get service URL (minikube)
minikube service api-principal-service -n syos-monitoring

# Or port-forward
kubectl port-forward service/api-principal-service 3000:80 -n syos-monitoring
```

### 6. Scale Services

```bash
# Scale notification service to 5 replicas
kubectl scale deployment/notification-service --replicas=5 -n syos-monitoring

# Scale sensor service to 3 replicas
kubectl scale deployment/sensor-service --replicas=3 -n syos-monitoring
```

### 7. Cleanup

```bash
# Delete all resources
kubectl delete namespace syos-monitoring
```

## 📡 API Documentation

### Base URL
```
http://localhost:3000
```

### Endpoints

#### 1. Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "api-principal"
}
```

#### 2. Register Sensor
```http
POST /api/sensors
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Office Sensor",
  "location": "Building A - Floor 3",
  "minTemperature": 18,
  "maxTemperature": 26,
  "minHumidity": 30,
  "maxHumidity": 70
}
```

**Response:**
```json
{
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
GET /dashboard
```
Returns HTML dashboard with DustJS template.

#### 6. Dashboard Data (JSON)
```http
GET /api/dashboard
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sensors": [...],
    "recentAlerts": [...],
    "statistics": {
      "totalSensors": 5,
      "activeSensors": 4,
      "totalAlerts": 12
    }
  }
}
```

## 🧪 Testing

Comprehensive test suite with 100+ tests covering all layers of the hexagonal architecture.

### Run Tests

```bash
# Run tests for all services
cd api-principal && npm test
cd sensor-service && npm test
cd notification-service && npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

### Test Coverage

- **Domain Layer**: Entity and Value Object tests (51 tests)
- **Application Layer**: Use Case tests with mocks (37 tests)
- **Adapter Layer**: Controller and integration tests (12 tests)
- **Total**: 100 tests across all services

### Test Structure

```
tests/
├── domain/
│   ├── entities/          # Entity business logic tests
│   └── value-objects/     # Value object validation tests
├── application/
│   └── use-cases/         # Use case orchestration tests
└── adapters/
    └── http/              # Controller and route tests
```

See the complete [Testing Documentation](./TESTING.md) for detailed test information.

## 📁 Project Structure

```
Syos/
├── api-principal/                 # API and Dashboard Service
│   ├── src/
│   │   ├── domain/               # Business logic
│   │   │   ├── entities/         # Sensor, Alert entities
│   │   │   ├── value-objects/    # Temperature, Humidity, SensorLimits
│   │   │   └── ports/            # Interfaces (ISensorRepository, ILogger)
│   │   ├── application/          # Use cases
│   │   │   ├── use-cases/        # RegisterSensor, GetSensors, GetDashboardData
│   │   │   └── dtos/             # Data Transfer Objects
│   │   ├── infrastructure/       # External implementations
│   │   │   ├── database/         # TinyBone repositories
│   │   │   └── config/           # Database, RabbitMQ, Logger config
│   │   ├── adapters/             # External interfaces
│   │   │   ├── http/             # Controllers, routes
│   │   │   └── views/            # DustJS templates
│   │   └── index.ts              # Main entry point
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── sensor-service/                # Data Collection Service (IIFE)
│   ├── src/
│   │   ├── domain/
│   │   ├── application/
│   │   │   └── use-cases/        # CollectSensorDataUseCase
│   │   ├── infrastructure/
│   │   │   ├── database/
│   │   │   └── rabbitmq/         # RabbitMQ Producer
│   │   └── index.ts              # IIFE main
│   ├── Dockerfile
│   └── package.json
│
├── notification-service/          # Alert Processing Service (IIFE)
│   ├── src/
│   │   ├── domain/
│   │   ├── application/
│   │   │   └── use-cases/        # ProcessAlertUseCase
│   │   ├── infrastructure/
│   │   │   ├── database/
│   │   │   └── rabbitmq/         # RabbitMQ Consumer
│   │   └── index.ts              # IIFE main
│   ├── Dockerfile
│   └── package.json
│
├── k8s/                           # Kubernetes manifests
│   ├── 00-namespace.yaml
│   ├── 01-configmap.yaml
│   ├── 02-secrets.yaml
│   ├── 03-postgres.yaml
│   ├── 04-rabbitmq.yaml
│   ├── 05-api-principal.yaml
│   ├── 06-sensor-service.yaml
│   ├── 07-notification-service.yaml
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

**Problem**: No alerts being generated
```bash
# Check if sensors are registered
curl http://localhost:3000/api/sensors

# Check sensor service logs
docker-compose logs sensor-service

# Check notification service logs
docker-compose logs notification-service
```

**Problem**: Dashboard not loading
```bash
# Check API Principal logs
docker-compose logs api-principal

# Verify database tables exist
docker-compose exec postgres psql -U postgres -d sensor_monitoring -c "\dt"
```

## 🧪 Testing

### Manual Testing

```bash
# 1. Register a sensor
curl -X POST http://localhost:3000/api/sensors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Sensor",
    "location": "Test Lab",
    "minTemperature": 20,
    "maxTemperature": 25,
    "minHumidity": 40,
    "maxHumidity": 60
  }'

# 2. Wait for sensor service to collect data (10 seconds)

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
