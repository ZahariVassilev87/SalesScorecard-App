FROM node:18

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application (without Prisma generate)
RUN rm -rf dist && npx tsc

# Expose port
EXPOSE 3000

# Start the application with Prisma generation
CMD ["sh", "-c", "npx prisma generate && npm run start:prod"]
