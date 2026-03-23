FROM node:22-alpine

WORKDIR /app

# Install dependencies first for better layer caching
COPY package*.json ./
RUN npm install --omit=dev

# Copy app source
COPY . .

EXPOSE 5000

CMD ["node", "index.js"]
