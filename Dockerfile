# Stage 1: Install dependencies only (shared across all services)
FROM oven/bun:1 AS deps
WORKDIR /app

# Install system dependencies for native modules
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy package files for workspace dependency resolution
COPY package.json bun.lock* ./
COPY packages/api-server/package.json ./packages/api-server/
COPY packages/db/package.json ./packages/db/
COPY packages/shared/package.json ./packages/shared/
COPY packages/build-worker/package.json ./packages/build-worker/
COPY packages/dashboard/package.json ./packages/dashboard/
COPY packages/request-handler/package.json ./packages/request-handler/
COPY packages/ai-service/package.json ./packages/ai-service/
COPY packages/cli/package.json ./packages/cli/

# Install all dependencies with BuildKit cache
# Use --ignore-scripts to skip optional native module builds (msgpackr-extract, cpu-features)
RUN --mount=type=cache,id=bun-cache,target=/root/.bun/install/cache \
    bun install --ignore-scripts

# Stage 2: Generate Prisma client (depends on deps)
FROM deps AS builder-base

# Copy all source code once to share across build stages
COPY packages/db ./packages/db
COPY packages/shared ./packages/shared
COPY packages/ai-service ./packages/ai-service
COPY packages/api-server ./packages/api-server
COPY packages/build-worker ./packages/build-worker
COPY packages/request-handler ./packages/request-handler
COPY packages/dashboard ./packages/dashboard

WORKDIR /app/packages/db
RUN bun run db:generate

# Stage 3: Build Dashboard
FROM builder-base AS dashboard-builder
WORKDIR /app/packages/dashboard
RUN bun run build

# Dashboard runner (minimal production image)
FROM node:20-alpine AS dashboard-runner
WORKDIR /app
COPY --from=dashboard-builder /app/packages/dashboard/.next/standalone ./
COPY --from=dashboard-builder /app/packages/dashboard/.next/static ./.next/static
COPY --from=dashboard-builder /app/packages/dashboard/public ./public
ENV NODE_ENV=production
# Install production dependencies (standalone build has package.json)
RUN npm install --omit=dev
EXPOSE 3000
CMD ["node", "server.js"]

# Stage 4: Build API Server
FROM builder-base AS api-builder
WORKDIR /app/packages/api-server
RUN bun run build

# API Server runner
FROM deps AS api-server
COPY --from=api-builder /app/packages/db ./packages/db
COPY --from=api-builder /app/packages/shared ./packages/shared
COPY --from=api-builder /app/packages/api-server ./packages/api-server
WORKDIR /app/packages/api-server
EXPOSE 3001
CMD ["bun", "dist/index.js"]

# Stage 5: Build Request Handler
FROM builder-base AS request-handler-builder
WORKDIR /app/packages/request-handler
RUN bun run build

# Request Handler runner
FROM deps AS request-handler
COPY --from=request-handler-builder /app/packages/db ./packages/db
COPY --from=request-handler-builder /app/packages/shared ./packages/shared
COPY --from=request-handler-builder /app/packages/request-handler ./packages/request-handler
WORKDIR /app/packages/request-handler
EXPOSE 3002
CMD ["bun", "dist/index.js"]

# Stage 6: Build Worker
FROM builder-base AS build-worker-builder
WORKDIR /app/packages/build-worker
RUN bun run build

# Build Worker runner
FROM deps AS build-worker
COPY --from=build-worker-builder /app/packages/db ./packages/db
COPY --from=build-worker-builder /app/packages/shared ./packages/shared
COPY --from=build-worker-builder /app/packages/ai-service ./packages/ai-service
COPY --from=build-worker-builder /app/packages/build-worker ./packages/build-worker
WORKDIR /app/packages/build-worker
CMD ["bun", "dist/index.js"]
