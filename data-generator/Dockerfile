# First stage: build the application
FROM node:16-alpine AS build

# Set the working directory to /app
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install dependencies
RUN npm ci --quiet --only=production

# Copy the source code to the container
COPY . .

# Compile the TypeScript code
RUN npm run build

# Second stage: run the application
FROM node:16-alpine

# Set the working directory to /app
WORKDIR /app

# Copy the Node.js dependencies from the first stage
COPY --from=build /app/node_modules ./node_modules

# Copy the compiled JavaScript code from the first stage
COPY --from=build /app/dist ./dist

# Expose the port used by the CLI tool (optional)
EXPOSE 8080

# Set the default command to run the CLI tool
CMD ["node", "dist/index.js"]
