#!/bin/bash
# TODO 10: Kubernetes deployment script

set -e

echo "Deploying SYOS Sensor Monitoring System to Kubernetes..."

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW} Building Docker images...${NC}"
docker build -t syos-api-principal:latest ./api-principal
docker build -t syos-sensor-service:latest ./sensor-service
docker build -t syos-notification-service:latest ./notification-service

echo -e "${GREEN}✓ Images built successfully${NC}"

# Step 2: Load images to Kubernetes (for local clusters)
if command -v minikube &> /dev/null; then
    echo -e "${YELLOW} Loading images to minikube...${NC}"
    minikube image load syos-api-principal:latest
    minikube image load syos-sensor-service:latest
    minikube image load syos-notification-service:latest
    echo -e "${GREEN}✓ Images loaded to minikube${NC}"
elif command -v kind &> /dev/null; then
    echo -e "${YELLOW} Loading images to kind...${NC}"
    kind load docker-image syos-api-principal:latest
    kind load docker-image syos-sensor-service:latest
    kind load docker-image syos-notification-service:latest
    echo -e "${GREEN}✓ Images loaded to kind${NC}"
else
    echo -e "${YELLOW}⚠️  No local Kubernetes cluster detected. Skipping image load.${NC}"
fi

# Step 3: Apply Kubernetes manifests
echo -e "${YELLOW} Applying Kubernetes manifests...${NC}"

kubectl apply -f k8s/00-namespace.yaml
echo -e "${GREEN}✓ Namespace created${NC}"

kubectl apply -f k8s/01-configmap.yaml
kubectl apply -f k8s/02-secrets.yaml
echo -e "${GREEN}✓ Configuration applied${NC}"

kubectl apply -f k8s/03-postgres.yaml
kubectl apply -f k8s/04-rabbitmq.yaml
echo -e "${GREEN}✓ Databases deployed${NC}"

# Step 4: Wait for databases to be ready
echo -e "${YELLOW}⏳ Waiting for PostgreSQL to be ready...${NC}"
kubectl wait --for=condition=ready pod -l app=postgres -n syos-monitoring --timeout=300s

echo -e "${YELLOW}⏳ Waiting for RabbitMQ to be ready...${NC}"
kubectl wait --for=condition=ready pod -l app=rabbitmq -n syos-monitoring --timeout=300s

echo -e "${GREEN}✓ Databases are ready${NC}"

# Step 5: Deploy application services
echo -e "${YELLOW} Deploying application services...${NC}"
kubectl apply -f k8s/05-api-principal.yaml
kubectl apply -f k8s/06-sensor-service.yaml
kubectl apply -f k8s/07-notification-service.yaml
kubectl apply -f k8s/08-ingress.yaml

echo -e "${GREEN}✓ Application services deployed${NC}"

# Step 6: Wait for services to be ready
echo -e "${YELLOW} Waiting for services to be ready...${NC}"
sleep 10

kubectl wait --for=condition=ready pod -l app=api-principal -n syos-monitoring --timeout=300s

echo -e "${GREEN}✓ All services are ready!${NC}"

# Step 7: Display access information
echo ""
echo "═══════════════════════════════════════════════════════════"
echo -e "${GREEN}Deployment completed successfully!${NC}"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Check deployment status:"
echo "  kubectl get pods -n syos-monitoring"
echo ""
echo "View logs:"
echo "  kubectl logs -f deployment/api-principal -n syos-monitoring"
echo "  kubectl logs -f deployment/sensor-service -n syos-monitoring"
echo "  kubectl logs -f deployment/notification-service -n syos-monitoring"
echo ""
echo "Access the application:"

if command -v minikube &> /dev/null; then
    echo "  minikube service api-principal-service -n syos-monitoring"
elif command -v kubectl &> /dev/null; then
    echo "  kubectl port-forward service/api-principal-service 3000:80 -n syos-monitoring"
    echo "  Then open: http://localhost:3000/dashboard"
fi

echo ""
echo " To cleanup:"
echo "  kubectl delete namespace syos-monitoring"
echo ""
