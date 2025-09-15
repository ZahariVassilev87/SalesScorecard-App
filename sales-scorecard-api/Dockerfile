FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npx tsc

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/main.js"]