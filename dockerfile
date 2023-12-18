# Set the base image to use for subsequent instructions
FROM node:alpine

# Set the working directory for any subsequent ADD, COPY, CMD, ENTRYPOINT,
# or RUN instructions that follow it in the Dockerfile
WORKDIR /usr/src/app

# Copy files or folders from source to the dest path in the image's filesystem.
COPY package*.json  ./
COPY . /usr/src/app/
COPY .env ./

# Execute any commands on top of the current image as a new layer and commit the results.
RUN npm install 
ARG NODE_ENV

# ARG ACCESS_TOKEN_SECRET
# ARG ACCESS_TOKEN_SECRET

ENV ACCESS_TOKEN_SECRET=24c7d046a030283a315fbdc925ded89428ef9ec3a878081d835248fbde4ea3bc1dbef5c4a3bb73e6ea39d94102b9c5e0e13a4f3f01672907dca14ad0dbdef991
ENV REFRESH_TOKEN_SECRET=5a3f4a3d0f6e645f243fb25a4fe558bf9da96fd95a5fa45d1e6684d49e720b452d2349c2084ba4ce623df73749edecab5f0a209a30c2538ef0115856131ce69a
# ARG NODE_ENV
# ENV ACCESS_TOKEN_SECRET "$ACCESS_TOKEN_SECRET"
# ENV REFRESH_TOKEN_SECRET "$REFRESH_TOKEN_SECRET"
# Define the network ports that this container will listen to at runtime.
EXPOSE 8001

# Configure the container to be run as an executable.
# ENTRYPOINT [ "/bin/sh", "-c", "npm start"]
ENTRYPOINT ["npm", "start"]