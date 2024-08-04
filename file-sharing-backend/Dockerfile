# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) files
COPY package*.json ./

# Install application dependencies
RUN npm install

EXPOSE 5000

# Copy the rest of your application code to the container
COPY . .


# Define the command to run your application
CMD ["node", "app.js"]
