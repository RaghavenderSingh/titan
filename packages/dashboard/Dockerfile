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
WORKDIR /app/packages/dashboard
RUN bun run build

# Production image
FROM oven/bun:1 AS runner
WORKDIR /app

COPY --from=base /app/packages/dashboard/.next/standalone ./
COPY --from=base /app/packages/dashboard/.next/static ./packages/dashboard/.next/static
COPY --from=base /app/packages/dashboard/public ./packages/dashboard/public

EXPOSE 3000
CMD ["bun", "server.js"]
