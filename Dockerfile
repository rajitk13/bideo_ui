# Build the app
FROM node:18-slim AS builder
WORKDIR /app

# Install git so git rev-parse commands work during build
RUN apt-get update -qq && apt-get install -y -qq git && rm -rf /var/lib/apt/lists/*

# Accept build arguments passed from CI/CD or docker-compose
ARG NEXT_PUBLIC_GIT_COMMIT_SHA
ARG NEXT_PUBLIC_BUILD_NUMBER
ARG NEXT_PUBLIC_API_URL
ARG GIT_COMMIT
ARG BUILD_NUMBER

# Export environment variables for Next.js build
ENV NEXT_PUBLIC_GIT_COMMIT_SHA=${NEXT_PUBLIC_GIT_COMMIT_SHA:-${GIT_COMMIT}}
ENV NEXT_PUBLIC_BUILD_NUMBER=${NEXT_PUBLIC_BUILD_NUMBER:-${BUILD_NUMBER}}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-https://buzzclips.app/api}

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Serve the app
FROM node:18-slim
WORKDIR /app
COPY --from=builder /app ./
EXPOSE 3000
CMD ["npm", "run", "start"]