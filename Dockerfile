# Stage 1: build
FROM node:20-alpine AS builder

WORKDIR /discord-monitor
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: production
FROM node:20-alpine

WORKDIR /discord-monitor

COPY --from=builder /discord-monitor/dist ./dist
COPY --from=builder /discord-monitor/node_modules ./node_modules
COPY servers.yaml .

CMD ["node", "dist/main"]