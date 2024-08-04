FROM node:18-alpine

# Set the working directory in the container
WORKDIR /react-docker-example/

# Copy package.json and package-lock.json (if available) first to leverage Docker cache
COPY package.json ./
COPY package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY public/ /react-docker-example/public
COPY src/ /react-docker-example/src

# Expose the port your app runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]
