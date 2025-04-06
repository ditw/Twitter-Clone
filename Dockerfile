# Use the official Node.js 22 runtime as a base image
FROM node:22

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json for dependencies installation
COPY package*.json ./

# Install project dependencies
RUN npm install

# Install TypeScript globally
RUN npm install -g typescript

# Copy the project files
COPY . .

# Copy the .env file for environment variables
COPY .env .env

# Compile TypeScript files
RUN tsc

# Expose the application port (APP_PORT will be used dynamically, e.g: 3000)
EXPOSE ${APP_PORT}

# Specify the command to run the application
CMD ["npm", "start"]
