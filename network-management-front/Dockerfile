# ─── Build Stage ────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN apk add --no-cache python3 py3-pillow \
  && python3 scripts/generate-app-icons.py \
  && npm run build

# ─── Production Stage (nginx serves static files) ───────────────────────────
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy Vite build output
COPY --from=builder /app/dist .

# Copy our custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
