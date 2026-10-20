pipeline {
    agent any

    stages {
        stage('Unit Tests') {
            steps {
                sh '''
                    set -eux
                    echo "🧪 Running Frontend Unit Tests..."

                    if [ ! -d "node_modules" ]; then
                        npm ci || npm install
                    fi

                    npm test -- --ci --maxWorkers=2
                '''
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    set -eux

                    # Install Maven if not available
                    if ! command -v mvn >/dev/null 2>&1; then
                        echo "📦 Installing Maven..."
                        apt-get update -qq && apt-get install -y -qq maven || {
                            # Fallback: download Maven manually
                            curl -fsSL https://dlcdn.apache.org/maven/maven-3/3.9.9/binaries/apache-maven-3.9.9-bin.tar.gz | tar xz -C /opt/
                            export PATH="/opt/apache-maven-3.9.9/bin:$PATH"
                        }
                    fi

                    git config --global --add safe.directory /home/rajit/Bideo_proj || true
                    git config --global --add safe.directory /home/rajit/Bideo_proj/bideo_api || true
                    git config --global --add safe.directory /home/rajit/Bideo_proj/bideo_ui || true
                    git config --global --add safe.directory '*' || true

                    cd /home/rajit/Bideo_proj

                    chmod +x script.sh
                    ./script.sh
                '''
            }
        }
    }

    post {
        success {
            echo 'Deployment successful'
        }

        failure {
            echo 'Deployment failed'
        }
    }
}
