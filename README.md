# Discord Server Monitor

A NestJS application that monitors server health and sends notifications to Discord when servers go down or come back online.

## Overview

This project provides a simple but effective way to monitor the health of your servers. It periodically checks server health endpoints and sends notifications to Discord webhooks when server status changes.

## Features

- Periodic health checks of multiple servers
- Discord notifications for server status changes (down/up)
- Configurable check intervals and timeouts
- Downtime tracking
- Docker support for easy deployment

## Project Structure

```
discord-monitor/
├── src/                      # Source code
│   ├── config/               # Configuration files
│   │   └── configuration.ts  # YAML configuration loader
│   ├── app.module.ts         # Main application module
│   ├── app.service.ts        # Service with monitoring logic
│   └── main.ts               # Application entry point
├── servers-example.yaml      # Example server configuration
├── servers.yaml              # Your server configuration (gitignored)
├── Dockerfile                # Docker configuration
├── docker-compose.yml        # Docker Compose configuration
└── package.json              # Project dependencies
```

## Configuration

Create a `servers.yaml` file in the root directory based on the provided `servers-example.yaml`:

```yaml
- name: Your server 1
  healthCheckUrl: https://your-server-1.com/health
  discordWebhook: https://discord.com/api/webhooks/your-webhook-url
  timeout: 10000  # Timeout in milliseconds

- name: Your server 2
  healthCheckUrl: https://your-server-2.com/health
  discordWebhook: https://discord.com/api/webhooks/your-webhook-url
  timeout: 10000
```

### Configuration Options

Each server entry supports the following options:

- `name`: A friendly name for your server
- `healthCheckUrl`: The URL to check for server health
- `discordWebhook`: Discord webhook URL for notifications
- `timeout`: Request timeout in milliseconds

## Running with Docker

### Using Docker Compose (Recommended)

1. Create your `servers.yaml` configuration file
2. Run the application:

```bash
docker-compose up -d
```

This will build the Docker image and start the container in detached mode.

### Using Docker Directly

1. Build the Docker image:

```bash
docker build -t discord-monitor .
```

2. Run the container:

```bash
docker run -d --name discord_monitor -v $(pwd)/servers.yaml:/discord-monitor/servers.yaml discord-monitor
```

## Development

### Prerequisites

- Node.js 20 or higher
- npm

### Installation

```bash
npm install
```

### Running Locally

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

### Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## License

This project is licensed under the UNLICENSED license.