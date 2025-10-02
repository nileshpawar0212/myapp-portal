FROM node:18

WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy application files
COPY app.js ./
COPY public/ ./public/

EXPOSE 3000
CMD ["node", "app.js"]
