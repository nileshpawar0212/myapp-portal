# Database Request Portal

A Node.js web application for managing MySQL databases and users in Kubernetes.

## Features

- **Database Connection Status** - Real-time MySQL connection monitoring
- **User Management** - Create database users with specific database access
- **User Listing** - View all existing database users
- **SQL Query Execution** - Execute custom SQL queries
- **Kubernetes Ready** - Designed for K8s deployment with MetalLB

## Architecture

### Backend (app.js)
- **Express.js** server on port 3000
- **MySQL2** for database connections
- **API Endpoints**:
  - `GET /` - Serves frontend HTML
  - `GET /api/status` - Database connection status
  - `POST /api/create-user` - Creates database user
  - `GET /api/users` - Lists database users
  - `POST /api/query` - Executes SQL queries

### Frontend (public/index.html)
- **Vanilla JavaScript** - No frameworks
- **Responsive UI** - Clean, minimal design
- **Real-time Updates** - Auto-refresh connection status
- **Form Validation** - Client-side input validation

### Database Configuration
- **Primary Config** - For general queries and status
- **Admin Config** - For user management (requires root privileges)
- **Environment Variables** - K8s secrets for credentials

## Prerequisites

- Node.js and NPM
- Docker
- Kubernetes cluster
- MetalLB (for LoadBalancer)
- kubectl configured

## Standard Operating Procedure (SOP)

### Step 1: Prepare Environment
```bash
# Clone/download the project
cd myapp-portal

# Install dependencies (for local testing)
npm install
```

### Step 2: Configure Database Credentials
```bash
# Edit secret.yaml - Change the password!
# Current: base64 encoded 'password'
echo -n 'your-new-password' | base64
# Update secret.yaml with new encoded password
```

### Step 3: Build Docker Image
```bash
# Build the image
docker build -t nileshpawar0212/myapp-portal:latest .

# Push to registry
docker push nileshpawar0212/myapp-portal:latest
```

### Step 4: Deploy to Kubernetes
```bash
# Method 1: Use deployment script
chmod +x deploy.sh
./deploy.sh

# Method 2: Manual deployment
kubectl apply -f namespace.yaml
kubectl apply -f secret.yaml
kubectl apply -f mysql-deploy.yaml
kubectl apply -f myapp-portal-deploy.yaml
kubectl apply -f myapp-portal-svc.yaml
```

### Step 5: Verify Deployment
```bash
# Check pod status
kubectl get pods -n myapp-portal

# Check services
kubectl get svc -n myapp-portal

# Get external IP (MetalLB)
kubectl get svc myapp-portal-svc -n myapp-portal
```

### Step 6: Access Application
```bash
# Get the external IP from MetalLB
EXTERNAL_IP=$(kubectl get svc myapp-portal-svc -n myapp-portal -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
echo "Access portal at: http://$EXTERNAL_IP"
```

## File Structure

```
myapp-portal/
├── app.js                    # Main Node.js application
├── public/
│   └── index.html           # Frontend interface
├── package.json             # Node.js dependencies
├── Dockerfile              # Container build instructions
├── namespace.yaml          # K8s namespace
├── secret.yaml             # Database credentials
├── mysql-deploy.yaml       # MySQL deployment & service
├── myapp-portal-deploy.yaml # App deployment
├── myapp-portal-svc.yaml   # App service (MetalLB)
├── deploy.sh               # Deployment script
├── .dockerignore           # Docker build exclusions
└── .gitignore              # Git exclusions
```

## Environment Variables

| Variable | Description | Source |
|----------|-------------|--------|
| `DB_HOST` | MySQL service hostname | K8s deployment |
| `DB_NAME` | Default database name | K8s deployment |
| `DB_USER` | Database username | K8s secret |
| `DB_PASSWORD` | Database password | K8s secret |

## Usage

1. **Check Status** - View database connection status
2. **Create User** - Enter database name, username, password
3. **View Users** - Click "Show Existing Users"
4. **Execute Queries** - Run custom SQL commands

## Troubleshooting

### Pod Not Starting
```bash
kubectl describe pod -l app=myapp-portal -n myapp-portal
kubectl logs -l app=myapp-portal -n myapp-portal
```

### Database Connection Issues
```bash
# Check MySQL pod
kubectl get pods -l app=myapp-mysql -n myapp-portal

# Check MySQL logs
kubectl logs -l app=myapp-mysql -n myapp-portal
```

### No External IP (MetalLB)
```bash
# Check MetalLB configuration
kubectl get configmap -n metallb-system

# Check MetalLB pods
kubectl get pods -n metallb-system
```

## Security Notes

- Change default password in `secret.yaml`
- Use strong passwords for database users
- Limit SQL query access in production
- Consider network policies for pod communication

## Jenkins CI/CD Deployment

### Prerequisites for Jenkins
- Jenkins server with Docker and kubectl installed
- Docker Hub credentials configured in Jenkins
- Kubernetes config file configured in Jenkins

### Jenkins Credentials Setup
```bash
# Add these credentials in Jenkins:
# 1. docker-hub (Username/Password) - Docker Hub credentials
# 2. kubeconfig (Secret file) - Kubernetes config file
```

### Jenkins Pipeline
The `Jenkinsfile` automates:
1. **Code Checkout** - Pulls latest code from repository
2. **Docker Build** - Builds and pushes image with build number tag
3. **Update Deployment** - Updates K8s deployment with new image tag
4. **Deploy to K8s** - Applies all Kubernetes manifests
5. **Verify Deployment** - Checks rollout status and displays service info

### Manual Jenkins Setup
1. Create new Pipeline job in Jenkins
2. Configure SCM to point to your repository
3. Set Pipeline script from SCM
4. Add required credentials
5. Run the pipeline

## MetalLB Configuration

This application uses `LoadBalancer` service type with MetalLB. Ensure your MetalLB is configured with an IP pool:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: metallb-system
  name: config
data:
  config: |
    address-pools:
    - name: default
      protocol: layer2
      addresses:
      - 192.168.1.100-192.168.1.110
```