FROM oven/bun:1 AS base

# Install system dependencies for native modules
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy lockfile and all package.json files first
COPY package.json bun.lock* ./
COPY packages/api-server/package.json ./packages/api-server/
COPY packages/db/package.json ./packages/db/
COPY packages/shared/package.json ./packages/shared/
COPY packages/build-worker/package.json ./packages/build-worker/
COPY packages/dashboard/package.json ./packages/dashboard/
COPY packages/request-handler/package.json ./packages/request-handler/
COPY packages/ai-service/package.json ./packages/ai-service/
COPY packages/cli/package.json ./packages/cli/


# Install dependencies with build cache
RUN --mount=type=cache,id=bun,target=~/.bun/install/cache bun install


# Copy source code
COPY . .

# Generate Prisma client
WORKDIR /app/packages/db
RUN bun run db:generate

# Build the application
WORKDIR /app/packages/api-server
RUN bun run build

EXPOSE 3001

CMD ["bun", "dist/index.js"]