# Build Stage
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production Stage
FROM node:22-alpine
WORKDIR /app

# Install standard tools + OpenVPN
RUN apk add --no-cache curl openvpn iproute2 

# Expose the OpenVPN binary path so the app can resolve it dynamically
ENV OPENVPN_PATH=/usr/sbin/openvpn

COPY package*.json ./
RUN npm ci

# Copy compiled app
COPY --from=builder /app/dist ./dist

 # Copy migrations folder
COPY --from=builder /app/src/db ./src/db
COPY --from=builder /app/src/config ./src/config

# Copy drizzle config (needed by drizzle-kit migrate at runtime)
COPY --from=builder /app/src/drizzle.config.ts ./src/drizzle.config.ts

# Copy OpenVPN configuration
COPY --from=builder /app/cred.ovpn ./cred.ovpn

# Expose the port your app uses
EXPOSE 3000

# Start the app directly
CMD ["npm", "run", "start"]
