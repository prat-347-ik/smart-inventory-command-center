# 1. Use a lightweight Node.js base image
FROM node:18-alpine

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy dependency definitions first (Layer Caching optimization)
COPY package.json package-lock.json ./

# 4. Install production dependencies only
RUN npm ci --only=production

# 5. Copy the rest of the application code
COPY . .

# 6. Expose the port defined in your server.js
EXPOSE 4000

# 7. Start the application directly (bypass npm for better signal handling)
CMD ["node", "src/server.js"]