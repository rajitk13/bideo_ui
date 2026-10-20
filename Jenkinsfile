pipeline {
    agent any

    stages {
        stage('Unit Tests') {
            steps {
                sh '''
                    set -eux
                    echo "🧪 Preparing environment for Frontend Unit Tests..."

                    # 1. Search for existing node/npm installations in PATH or common paths
                    for node_dir in /usr/local/bin /usr/bin /opt/node/bin /home/rajit/.nvm/versions/node/*/bin /root/.nvm/versions/node/*/bin /var/jenkins_home/.nvm/versions/node/*/bin; do
                        if [ -x "$node_dir/npm" ]; then
                            export PATH="$node_dir:$PATH"
                            break
                        fi
                    done

                    # 2. If node/npm is still not found, download portable standalone Node.js
                    if ! command -v npm >/dev/null 2>&1; then
                        echo "📦 Node/npm not found. Downloading standalone Node.js..."
                        ARCH=$(uname -m)
                        case "$ARCH" in
                            x86_64) NODE_ARCH="x64" ;;
                            aarch64|arm64) NODE_ARCH="arm64" ;;
                            *) NODE_ARCH="x64" ;;
                        esac
                        NODE_VER="v20.18.0"
                        if [ ! -x "/tmp/node-standalone/bin/npm" ]; then
                            mkdir -p /tmp/node-standalone
                            curl -fsSL "https://nodejs.org/dist/${NODE_VER}/node-${NODE_VER}-linux-${NODE_ARCH}.tar.gz" | tar -xz -C /tmp/node-standalone --strip-components=1
                        fi
                        export PATH="/tmp/node-standalone/bin:$PATH"
                    fi

                    node -v
                    npm -v

                    # 3. Ensure dependencies are installed
                    if [ ! -d "node_modules" ]; then
                        npm ci || npm install
                    fi

                    # 4. Run unit tests in CI mode
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
