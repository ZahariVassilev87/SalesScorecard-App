FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build --verbose && ls -la dist/ && find . -name "*.js" -type f

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
