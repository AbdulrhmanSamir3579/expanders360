# Multi-stage build for Angular frontend
FROM node:20-alpine AS builder

WORKDIR /app

# Railway builds from repo root, so we need frontend/ prefix
COPY frontend/package*.json ./

RUN npm ci

COPY frontend/ .

RUN npm run build

# Production stage with Nginx
FROM nginx:alpine

COPY frontend/nginx.conf /etc/nginx/nginx.conf

COPY --from=builder /app/dist/frontend/browser /usr/share/nginx/html

COPY frontend/docker-entrypoint.sh /docker-entrypoint.sh
RUN sed -i 's/\r$//' /docker-entrypoint.sh && chmod +x /docker-entrypoint.sh

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

ENTRYPOINT ["/docker-entrypoint.sh"]
