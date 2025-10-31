pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE = 'nileshpawar0212/myapp-portal'
        DOCKER_TAG = "${BUILD_NUMBER}"
        KUBECONFIG = credentials('kubeconfig')
        DOCKER_REGISTRY = credentials('docker-hub')
        GIT_REPO = 'https://github.com/nileshpawar0212/myapp-portal.git'
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: "${GIT_REPO}"
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', 'docker-hub') {
                        def image = docker.build("${DOCKER_IMAGE}:${DOCKER_TAG}")
                        image.push()
                        image.push('latest')
                    }
                }
            }
        }
        
        stage('Update Deployment') {
            steps {
                script {
                    sh """
                        sed -i 's|image: ${DOCKER_IMAGE}:.*|image: ${DOCKER_IMAGE}:${DOCKER_TAG}|g' myapp-portal-deploy.yaml
                    """
                }
            }
        }
        
        stage('Deploy to Kubernetes') {
            steps {
                script {
                    sh """
                        # Check and create namespace if not exists
                        kubectl get namespace myapp-portal || kubectl apply -f namespace.yaml
                        
                        # Check and create secret if not exists
                        kubectl get secret myapp-db-secret -n myapp-portal || kubectl apply -f secret.yaml
                        
                        # Check and create MySQL deployment if not exists
                        kubectl get deployment myapp-mysql -n myapp-portal || kubectl apply -f mysql-deploy.yaml
                        
                        # Always update app deployment (for new image)
                        kubectl apply -f myapp-portal-deploy.yaml
                        
                        # Check and create service if not exists
                        kubectl get service myapp-portal-svc -n myapp-portal || kubectl apply -f myapp-portal-svc.yaml
                    """
                }
            }
        }
        
        stage('Verify Deployment') {
            steps {
                script {
                    sh """
                        kubectl rollout status deployment/myapp-portal -n myapp-portal --timeout=300s
                        kubectl get pods -n myapp-portal
                        kubectl get svc -n myapp-portal
                    """
                }
            }
        }
    }
    
    post {
        success {
            echo 'Deployment successful!'
            script {
                def externalIP = sh(
                    script: "kubectl get svc myapp-portal-svc -n myapp-portal -o jsonpath='{.status.loadBalancer.ingress[0].ip}'",
                    returnStdout: true
                ).trim()
                if (externalIP) {
                    echo "Application available at: http://${externalIP}"
                }
            }
        }
        failure {
            echo 'Deployment failed!'
        }
        always {
            cleanWs()
        }
    }
}