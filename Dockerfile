FROM node:18

WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

EXPOSE 3000
CMD ["node", "app.js"]
