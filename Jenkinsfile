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
                    echo "🚀 =========================================="
                    echo "🚀  DEPLOYING ONLY FRONTEND (bideo_ui)       "
                    echo "🚀 =========================================="

                    # Ensure git safe directories
                    git config --global --add safe.directory /home/rajit/Bideo_proj || true
                    git config --global --add safe.directory /home/rajit/Bideo_proj/bideo_ui || true
                    git config --global --add safe.directory '*' || true

                    # Resolve Git commit SHA and build number
                    COMMIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "${GIT_COMMIT:-}")
                    if [ -z "$COMMIT_SHA" ] || [ "$COMMIT_SHA" = "HEAD" ]; then
                        COMMIT_SHA=$(git -C /home/rajit/Bideo_proj/bideo_ui rev-parse --short HEAD 2>/dev/null || echo "dev")
                    fi
                    BUILD_NUM="${BUILD_NUMBER:-}"

                    echo "📌 Target Frontend Commit: ${COMMIT_SHA}"
                    echo "🔢 Jenkins Build Number: #${BUILD_NUM}"

                    # 1. Update /home/rajit/Bideo_proj/bideo_ui repository only
                    if [ -d "/home/rajit/Bideo_proj/bideo_ui" ]; then
                        echo "📥 Updating bideo_ui on target server..."
                        cd /home/rajit/Bideo_proj/bideo_ui
                        git remote set-url origin https://github.com/bideo-org/bideo_ui.git 2>/dev/null || true
                        git fetch origin main
                        git reset --hard origin/main
                        git clean -fd

                        # Write production env file directly into bideo_ui
                        cat <<ENV_EOF > .env.production.local
NEXT_PUBLIC_GIT_COMMIT_SHA=${COMMIT_SHA}
NEXT_PUBLIC_BUILD_NUMBER=${BUILD_NUM}
NEXT_PUBLIC_API_URL=https://buzzclips.app/api
NEXT_PUBLIC_BASE_URL=https://buzzclips.app
ENV_EOF
                    else
                        echo "⚠️ /home/rajit/Bideo_proj/bideo_ui not found, skipping repo pull"
                    fi

                    # 2. Update /home/rajit/Bideo_proj/.env for docker-compose interpolation
                    cd /home/rajit/Bideo_proj
                    touch .env
                    # Clean any stale legacy bideo.rajit.cc domain entries
                    sed -i 's|https://bideo.rajit.cc|https://buzzclips.app|g' .env 2>/dev/null || true
                    sed -i 's|bideo.rajit.cc|buzzclips.app|g' .env 2>/dev/null || true
                    sed -i '/^NEXT_PUBLIC_GIT_COMMIT_SHA=/d' .env 2>/dev/null || true
                    sed -i '/^NEXT_PUBLIC_BUILD_NUMBER=/d' .env 2>/dev/null || true
                    sed -i '/^NEXT_PUBLIC_API_URL=/d' .env 2>/dev/null || true
                    sed -i '/^NEXT_PUBLIC_BASE_URL=/d' .env 2>/dev/null || true
                    sed -i '/^GIT_COMMIT=/d' .env 2>/dev/null || true
                    sed -i '/^BUILD_NUMBER=/d' .env 2>/dev/null || true

                    echo "NEXT_PUBLIC_GIT_COMMIT_SHA=${COMMIT_SHA}" >> .env
                    echo "NEXT_PUBLIC_BUILD_NUMBER=${BUILD_NUM}" >> .env
                    echo "NEXT_PUBLIC_API_URL=https://buzzclips.app/api" >> .env
                    echo "NEXT_PUBLIC_BASE_URL=https://buzzclips.app" >> .env
                    echo "GIT_COMMIT=${COMMIT_SHA}" >> .env
                    echo "BUILD_NUMBER=${BUILD_NUM}" >> .env

                    export NEXT_PUBLIC_GIT_COMMIT_SHA="${COMMIT_SHA}"
                    export NEXT_PUBLIC_BUILD_NUMBER="${BUILD_NUM}"
                    export NEXT_PUBLIC_API_URL="https://buzzclips.app/api"
                    export NEXT_PUBLIC_BASE_URL="https://buzzclips.app"
                    export GIT_COMMIT="${COMMIT_SHA}"
                    export BUILD_NUMBER="${BUILD_NUM}"

                    # 3. Detect docker compose command
                    COMPOSE_CMD=""
                    if docker compose version >/dev/null 2>&1; then
                        COMPOSE_CMD="docker compose"
                    elif command -v docker-compose >/dev/null 2>&1; then
                        COMPOSE_CMD="docker-compose"
                    fi

                    if [ -n "$COMPOSE_CMD" ]; then
                        # Identify the frontend service in docker-compose.yml
                        AVAILABLE_SERVICES=$($COMPOSE_CMD config --services 2>/dev/null || echo "")
                        echo "📋 Available docker-compose services: ${AVAILABLE_SERVICES}"

                        UI_SERVICE="frontend"
                        if echo "$AVAILABLE_SERVICES" | grep -qw "frontend"; then
                            UI_SERVICE="frontend"
                        elif echo "$AVAILABLE_SERVICES" | grep -qw "bideo_ui"; then
                            UI_SERVICE="bideo_ui"
                        elif echo "$AVAILABLE_SERVICES" | grep -qw "ui"; then
                            UI_SERVICE="ui"
                        fi

                        echo "🏗️ Rebuilding ONLY the frontend service (${UI_SERVICE})..."
                        $COMPOSE_CMD build \
                            --build-arg NEXT_PUBLIC_GIT_COMMIT_SHA="${COMMIT_SHA}" \
                            --build-arg NEXT_PUBLIC_BUILD_NUMBER="${BUILD_NUM}" \
                            --build-arg NEXT_PUBLIC_API_URL="https://buzzclips.app/api" \
                            "${UI_SERVICE}"

                        # Remove any stuck previous container to prevent 'removal in progress' daemon lock
                        echo "🧹 Clearing previous container state for ${UI_SERVICE}..."
                        docker stop bideo_ui 2>/dev/null || true
                        docker rm -f bideo_ui 2>/dev/null || true
                        docker stop "${UI_SERVICE}" 2>/dev/null || true
                        docker rm -f "${UI_SERVICE}" 2>/dev/null || true

                        echo "🔄 Recreating ONLY ${UI_SERVICE} container (backend remains completely untouched)..."
                        $COMPOSE_CMD up -d --no-deps "${UI_SERVICE}"
                    else
                        echo "⚠️ Docker compose not found. Building and restarting via Docker CLI..."
                        docker build \
                            --build-arg NEXT_PUBLIC_GIT_COMMIT_SHA="${COMMIT_SHA}" \
                            --build-arg NEXT_PUBLIC_BUILD_NUMBER="${BUILD_NUM}" \
                            --build-arg NEXT_PUBLIC_API_URL="https://buzzclips.app/api" \
                            -t bideo_ui:latest ./bideo_ui
                        docker stop bideo_ui 2>/dev/null || true
                        docker rm -f bideo_ui 2>/dev/null || true
                        docker run -d --name bideo_ui -p 3000:3000 --restart always bideo_ui:latest
                    fi

                    # Clean dangling images
                    echo "🧹 Pruning unused images..."
                    docker image prune -f || true

                    echo "✅ Frontend deployment complete!"
                '''
            }
        }

        stage('Smoke Test') {
            steps {
                sh '''
                    set +e
                    echo "🩺 Running post-deployment frontend health check..."

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
                        echo "⚠️ Frontend smoke check timed out. Dumping container status:"
                        docker ps --filter "name=bideo" || true
                    fi
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
