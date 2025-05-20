FROM node:18-alpine as builder

# Create app directory for client build
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./
COPY src/client/package*.json ./src/client/

# Install dependencies
RUN npm install
RUN cd src/client && npm install

# Copy application code
COPY . .

# Build the client application
RUN cd src/client && npm run build

# Create production image
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm install --production

# Copy server code and built client
COPY --from=builder /usr/src/app/src/server ./src/server
COPY --from=builder /usr/src/app/src/client/build ./src/client/build

# Expose port
EXPOSE 3000

# Start the application
CMD [ "node", "src/server/index.js" ]
