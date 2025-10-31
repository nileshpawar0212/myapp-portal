pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE = 'nileshpawar0212/myapp-portal'
        DOCKER_TAG = "${BUILD_NUMBER}"
        KUBECONFIG = credentials('kubeconfig')
        DOCKER_REGISTRY = credentials('docker-hub')
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
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
                        kubectl apply -f namespace.yaml
                        kubectl apply -f secret.yaml
                        kubectl apply -f mysql-deploy.yaml
                        kubectl apply -f myapp-portal-deploy.yaml
                        kubectl apply -f myapp-portal-svc.yaml
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