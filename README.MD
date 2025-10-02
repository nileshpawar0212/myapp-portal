# Build the Docker image
docker build -t nileshpawar0212/myapp-portal:latest .

# Push to registry
docker push nileshpawar0212/myapp-portal:latest

# Deploy to Kubernetes
kubectl apply -f namespace.yaml
kubectl apply -f secret.yaml
kubectl apply -f mysql-deploy.yaml
kubectl apply -f myapp-portal-deploy.yaml
kubectl apply -f myapp-portal-svc.yaml