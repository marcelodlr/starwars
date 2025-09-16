# Multi-stage build for Star Wars project using Bun for both server and client

# Stage 1: Server dependencies
FROM oven/bun:1 as server-deps
WORKDIR /usr/src/app

# Copy server package.json and lock file for dependency caching
COPY server/package.json server/bun.lock* ./server/

# Install server dependencies
WORKDIR /usr/src/app/server
RUN bun install --frozen-lockfile

# Stage 2: Client build (React + TypeScript + Vite using Bun)
FROM oven/bun:1 as client-build
WORKDIR /usr/src/app

# Copy client package.json and lock file for dependency caching
COPY client/package.json client/bun.lock* ./client/

# Install client dependencies
WORKDIR /usr/src/app/client
RUN bun install --frozen-lockfile

# Copy client source code
COPY client/ ./

# Build the client (Vite build)
RUN bun run build

# Stage 3: Production runtime
FROM oven/bun:1 as production
WORKDIR /usr/src/app

# Copy server dependencies and source
COPY --from=server-deps /usr/src/app/server ./server
COPY server/src ./server/src
COPY server/tsconfig.json ./server/
COPY server/bunfig.toml ./server/

# Copy client build from Vite build
COPY --from=client-build /usr/src/app/client/dist ./server/public

# Expose the port that the server runs on
EXPOSE 3000

# Change to server directory
WORKDIR /usr/src/app/server

# Create directory for database and set permissions
RUN mkdir -p /usr/src/app/server/data && \
    chown -R bun:bun /usr/src/app/server

# Set environment variable for production
ENV NODE_ENV=production

# Set the user to bun for security
USER bun

# Start the application
CMD ["bun", "run", "src/index.ts"]
