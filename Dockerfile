# Use Node.js version
FROM node:24-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY scripts ./scripts

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Install serve to serve the built files
RUN npm install -g serve

# Expose port 3050
EXPOSE 3050

# Start the application
CMD ["serve", "-s", "dist", "-l", "3050"]
