# Star Wars Application

A full-stack Star Wars application built with React (client) and Hono (server), both powered by Bun runtime.

## Architecture

- **Client**: React + TypeScript + Vite + TanStack Router + Tailwind CSS
- **Server**: Hono + TypeScript + Bun
- **Runtime**: Bun for both client and server

## Running with Docker

### Prerequisites

- Docker installed on your system
- Docker Compose (optional, for development)

### Production Build

Build and run the containerized application:

```bash
# Build the Docker image
docker build -t startwars-app .

# Run the container
docker run -p 3000:3000 startwars-app
```

The application will be available at `http://localhost:3000`

### Development Setup

For development, you can run the client and server separately:

#### Option 1: Using Docker for Server Only

```bash
# Build development server image
docker build --target server-deps -t startwars-server-dev .

# Run server in development mode
docker run -p 3000:3000 -v $(pwd)/server:/usr/src/app/server startwars-server-dev bun run dev

# In another terminal, run client locally
cd client
bun install
bun run dev
```

#### Option 2: Local Development (Recommended)

```bash
# Install and run server
cd server
bun install
bun run dev

# In another terminal, install and run client
cd client
bun install
bun run dev
```

### Docker Image Details

The Dockerfile uses a multi-stage build process:

1. **server-deps**: Installs server dependencies
2. **client-build**: Builds the React client using Vite
3. **production**: Creates the final runtime image with server and built client

The production image:
- Serves the React client as static files from the server
- Exposes port 3000
- Runs as non-root user for security
- Uses Bun runtime for optimal performance

### Environment Variables

You can pass environment variables to the container:

```bash
docker run -p 3000:3000 -e NODE_ENV=production startwars-app
```

### Troubleshooting

- Ensure port 3000 is not already in use
- Check Docker logs: `docker logs <container-id>`
- Verify Bun version compatibility if building locally

## Local Development (Without Docker)

### Prerequisites

- [Bun](https://bun.sh/) installed on your system

### Setup

```bash
# Install server dependencies
cd server
bun install

# Install client dependencies
cd ../client
bun install
```

### Running

```bash
# Terminal 1: Start the server
cd server
bun run dev

# Terminal 2: Start the client
cd client
bun run dev
```

- Server runs on `http://localhost:3000`
- Client runs on `http://localhost:5173` (Vite dev server)