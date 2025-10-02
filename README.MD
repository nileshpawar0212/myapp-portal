# Prereq
Install Node Js and NPM

# Build the Docker image
docker build -t UserName/myapp-portal:latest .

# Push to registry
docker push UaseName/myapp-portal:latest

# Deploy to Kubernetes
kubectl apply -f namespace.yaml
kubectl apply -f secret.yaml
kubectl apply -f mysql-deploy.yaml
kubectl apply -f myapp-portal-deploy.yaml
kubectl apply -f myapp-portal-svc.yaml

# I used MetalLB
So do chnage as per usage