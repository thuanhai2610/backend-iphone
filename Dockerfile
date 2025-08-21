
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json và cài đặt deps
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy source code và build
COPY . .
RUN npm run build

# --------------------------
# Stage 2: Run (Production)
# --------------------------
FROM node:20-alpine

WORKDIR /app

# Copy package.json và cài deps production
COPY package*.json ./
RUN npm install --only=production --legacy-peer-deps

# Copy file build từ stage builder
COPY --from=builder /app/dist ./dist

# Copy .env nếu cần
COPY .env .env

# Expose port
EXPOSE 3001

CMD ["node", "dist/main"]
