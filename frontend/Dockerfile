# frontend/Dockerfile

# --- Stage 1: Build the React Application ---
FROM node:20-alpine as builder

WORKDIR /app

# Install dependencies (cache optimized)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Build for production (Vite)
RUN npm run build

# --- Stage 2: Serve with Nginx ---
FROM nginx:alpine as production

# Copy built assets from Stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy a simple Nginx config for the frontend service itself (SPA Routing)
# We will create this file inline or you can add it to the repo
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]