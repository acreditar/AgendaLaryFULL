# syntax=docker/dockerfile:1
FROM node:20-alpine AS base
WORKDIR /app

# Install only backend deps (assumes build context is the backend folder)
COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# Expose API port
EXPOSE 3001

# Set a default DB file path (can be overridden by env)
ENV DB_FILE=/app/backend-db.json

CMD ["npm", "start"]
