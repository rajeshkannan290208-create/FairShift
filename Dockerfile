# ==========================================
# STAGE 1: Build React Frontend
# ==========================================
FROM node:22-alpine AS frontend-builder
WORKDIR /build

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# ==========================================
# STAGE 2: Python Backend & Production Container
# ==========================================
FROM python:3.12-slim

# Security & environment setup
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8080 \
    APP_ENV=production

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application code
COPY backend ./backend

# Copy compiled frontend build from Stage 1
COPY --from=frontend-builder /build/dist ./frontend/dist

# Non-root user for security best practices on Cloud Run
RUN addgroup --system --gid 1001 fairshift && \
    adduser --system --uid 1001 --gid 1001 fairshift && \
    chown -R fairshift:fairshift /app

USER fairshift

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8080}/api/system/health || exit 1

CMD exec uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8080}
