#!/bin/bash

# Deploy to Kubernetes
echo "Creating namespace..."
kubectl apply -f namespace.yaml

echo "Creating secrets..."
kubectl apply -f secret.yaml

echo "Deploying MySQL..."
kubectl apply -f mysql-deploy.yaml

echo "Waiting for MySQL to be ready..."
kubectl wait --for=condition=ready pod -l app=myapp-mysql -n myapp-portal --timeout=300s

echo "Deploying application..."
kubectl apply -f myapp-portal-deploy.yaml
kubectl apply -f myapp-portal-svc.yaml

echo "Getting service info..."
kubectl get svc -n myapp-portal

echo "Deployment complete!"