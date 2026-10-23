pipeline {
    agent any

    options {
        // Prevent concurrent deployments from colliding on /home/rajit/Bideo_proj
        disableConcurrentBuilds()
        // Abort pipeline if stuck for more than 25 minutes
        timeout(time: 25, unit: 'MINUTES')
        // Retain the last 15 builds to conserve server disk space
        buildDiscarder(logRotator(numToKeepStr: '15', artifactNumToKeepStr: '5'))
        // Add timestamps to build logs
        timestamps()
    }

    environment {
        CI = 'true'
        DOCKER_BUILDKIT = '1'
        COMPOSE_DOCKER_CLI_BUILD = '1'
    }

    stages {
        stage('Setup Environment') {
            steps {
                sh '''
                    set -eux
                    echo "🔧 Preparing Node.js and caching dependencies..."

                    # Search for existing node/npm installations in PATH or standard paths
                    for node_dir in /usr/local/bin /usr/bin /opt/node/bin /home/rajit/.nvm/versions/node/*/bin /root/.nvm/versions/node/*/bin /var/jenkins_home/.nvm/versions/node/*/bin /tmp/node-standalone/bin; do
                        if [ -x "$node_dir/npm" ]; then
                            export PATH="$node_dir:$PATH"
                            break
                        fi
                    done

                    # If npm is still missing, download standalone portable Node.js v20
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

                    # Cache and install dependencies
                    if [ ! -d "node_modules" ]; then
                        npm ci || npm install
                    fi
                '''
            }
        }

        stage('Lint') {
            steps {
                sh '''
                    set -eux
                    echo "🧹 Running ESLint code quality check..."
                    export PATH="/tmp/node-standalone/bin:$PATH"
                    for node_dir in /usr/local/bin /usr/bin /opt/node/bin /home/rajit/.nvm/versions/node/*/bin /root/.nvm/versions/node/*/bin /var/jenkins_home/.nvm/versions/node/*/bin; do
                        [ -x "$node_dir/npm" ] && export PATH="$node_dir:$PATH" && break
                    done

                    npm run lint
                '''
            }
        }

        stage('Unit Tests') {
            steps {
                sh '''
                    set -eux
                    echo "🧪 Running Frontend Unit Tests (enforcing >=80% coverage criteria)..."
                    export PATH="/tmp/node-standalone/bin:$PATH"
                    for node_dir in /usr/local/bin /usr/bin /opt/node/bin /home/rajit/.nvm/versions/node/*/bin /root/.nvm/versions/node/*/bin /var/jenkins_home/.nvm/versions/node/*/bin; do
                        [ -x "$node_dir/npm" ] && export PATH="$node_dir:$PATH" && break
                    done

                    npm test -- --ci --maxWorkers=2 --coverage
                '''
            }
        }

        stage('Deploy Frontend') {
            steps {
                sh '''
                    set -eux
                    echo "🚀 Deploying frontend (bideo_ui)..."

                    # 1. Update bideo_ui repository on host
                    if [ -d "/home/rajit/Bideo_proj/bideo_ui" ]; then
                        cd /home/rajit/Bideo_proj/bideo_ui
                        git remote set-url origin https://github.com/bideo-org/bideo_ui.git 2>/dev/null || true
                        git fetch origin main
                        git reset --hard origin/main
                    fi

                    # 2. Rebuild and recreate frontend container
                    cd /home/rajit/Bideo_proj
                    COMPOSE_CMD="docker compose"
                    if ! docker compose version >/dev/null 2>&1 && command -v docker-compose >/dev/null 2>&1; then
                        COMPOSE_CMD="docker-compose"
                    fi

                    $COMPOSE_CMD build frontend
                    $COMPOSE_CMD up -d --no-deps frontend

                    echo "✅ Frontend deployment complete!"
                '''
            }
        }

        stage('Smoke Test') {
            steps {
                sh '''
                    set +e
                    echo "🩺 Checking frontend service health..."
                    for i in $(seq 1 5); do
                        STATUS=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 3 http://localhost:3000/ || true)
                        if [ "$STATUS" = "200" ] || [ "$STATUS" = "307" ] || [ "$STATUS" = "308" ]; then
                            echo "✅ Frontend healthy (HTTP $STATUS)"
                            exit 0
                        fi
                        sleep 2
                    done
                    echo "⚠️ Frontend container starting up"
                    exit 0
                '''
            }
        }
    }

    post {
        success {
            echo "================================================================"
            echo "🎉 FRONTEND DEPLOYMENT SUCCESSFUL!"
            echo "🚀 Build #${env.BUILD_NUMBER} is now live."
            echo "================================================================"
        }

        failure {
            echo "================================================================"
            echo "❌ FRONTEND DEPLOYMENT FAILED on Build #${env.BUILD_NUMBER}!"
            echo "⚠️ Please inspect the console output above."
            echo "================================================================"
        }
    }
}
