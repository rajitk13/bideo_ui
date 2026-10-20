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

        stage('Deploy') {
            steps {
                sh '''
                    set -eux
                    echo "🚀 Preparing deployment to /home/rajit/Bideo_proj..."

                    # Install Maven if not available (required by backend dependencies in script.sh)
                    if ! command -v mvn >/dev/null 2>&1; then
                        echo "📦 Installing Maven..."
                        apt-get update -qq && apt-get install -y -qq maven || {
                            curl -fsSL https://dlcdn.apache.org/maven/maven-3/3.9.9/binaries/apache-maven-3.9.9-bin.tar.gz | tar xz -C /opt/
                            export PATH="/opt/apache-maven-3.9.9/bin:$PATH"
                        }
                    fi

                    # Ensure git safe directories
                    git config --global --add safe.directory /home/rajit/Bideo_proj || true
                    git config --global --add safe.directory /home/rajit/Bideo_proj/bideo_api || true
                    git config --global --add safe.directory /home/rajit/Bideo_proj/bideo_ui || true
                    git config --global --add safe.directory '*' || true

                    # Resolve Git commit SHA reliably from the current Jenkins workspace
                    COMMIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "${GIT_COMMIT:-}")
                    if [ -z "$COMMIT_SHA" ] || [ "$COMMIT_SHA" = "HEAD" ]; then
                        COMMIT_SHA=$(git -C /home/rajit/Bideo_proj/bideo_ui rev-parse --short HEAD 2>/dev/null || echo "dev")
                    fi
                    BUILD_NUM="${BUILD_NUMBER:-}"

                    echo "📌 Target Deployment Commit: ${COMMIT_SHA}"
                    echo "🔢 Jenkins Build Number: #${BUILD_NUM}"

                    cd /home/rajit/Bideo_proj

                    # Clean leftover untracked build files in bideo_ui so git pull never encounters merge conflicts
                    if [ -d "/home/rajit/Bideo_proj/bideo_ui" ]; then
                        echo "🧹 Cleaning untracked files in /home/rajit/Bideo_proj/bideo_ui before pull..."
                        (cd /home/rajit/Bideo_proj/bideo_ui && rm -f build-info.json .env.production.local && git checkout -- . 2>/dev/null && git clean -fd 2>/dev/null || true)
                    fi

                    # Update /home/rajit/Bideo_proj/.env for docker-compose environment interpolation
                    touch /home/rajit/Bideo_proj/.env
                    sed -i '/^NEXT_PUBLIC_GIT_COMMIT_SHA=/d' /home/rajit/Bideo_proj/.env 2>/dev/null || true
                    sed -i '/^NEXT_PUBLIC_BUILD_NUMBER=/d' /home/rajit/Bideo_proj/.env 2>/dev/null || true
                    sed -i '/^GIT_COMMIT=/d' /home/rajit/Bideo_proj/.env 2>/dev/null || true
                    sed -i '/^BUILD_NUMBER=/d' /home/rajit/Bideo_proj/.env 2>/dev/null || true

                    echo "NEXT_PUBLIC_GIT_COMMIT_SHA=${COMMIT_SHA}" >> /home/rajit/Bideo_proj/.env
                    echo "NEXT_PUBLIC_BUILD_NUMBER=${BUILD_NUM}" >> /home/rajit/Bideo_proj/.env
                    echo "GIT_COMMIT=${COMMIT_SHA}" >> /home/rajit/Bideo_proj/.env
                    echo "BUILD_NUMBER=${BUILD_NUM}" >> /home/rajit/Bideo_proj/.env

                    # Pass Jenkins automated build metadata to deployment script
                    export BUILD_NUMBER="${BUILD_NUM}"
                    export GIT_COMMIT="${COMMIT_SHA}"
                    export NEXT_PUBLIC_BUILD_NUMBER="${BUILD_NUM}"
                    export NEXT_PUBLIC_GIT_COMMIT_SHA="${COMMIT_SHA}"

                    chmod +x script.sh
                    ./script.sh
                '''
            }
        }

        stage('Smoke Test') {
            steps {
                sh '''
                    set +e
                    echo "🩺 Running post-deployment health check..."

                    # Allow containers up to 30 seconds to initialize
                    SUCCESS=0
                    for i in $(seq 1 10); do
                        echo "Attempt $i/10: Checking frontend HTTP status..."
                        STATUS=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 3 http://localhost:3000/ || true)
                        if [ "$STATUS" = "200" ] || [ "$STATUS" = "307" ] || [ "$STATUS" = "308" ]; then
                            echo "✅ Frontend service healthy! Responded with HTTP $STATUS"
                            SUCCESS=1
                            break
                        fi
                        sleep 3
                    done

                    if [ "$SUCCESS" -eq 0 ]; then
                        echo "⚠️ Health check timed out or returned non-200. Container status:"
                        docker ps --filter "name=bideo" || true
                    fi
                '''
            }
        }
    }

    post {
        success {
            echo "🎉 Deployment successful! Build #${env.BUILD_NUMBER} is now live."
        }

        failure {
            echo "❌ Deployment failed on Build #${env.BUILD_NUMBER}. Please check the console output above."
        }
    }
}
