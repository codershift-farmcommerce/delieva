FROM node:20.11-bookworm

# Set working directory
WORKDIR /var/app/webapp

# Copy only package files first to leverage Docker layer caching
COPY ./webapp/package.json ./webapp/yarn.lock ./

# Clean Yarn cache before install to avoid extra disk usage
RUN yarn cache clean

# Install deps without optional modules (like swc-win32) and offline if possible
RUN yarn install --frozen-lockfile --ignore-optional --prefer-offline

# Now copy the rest of the app after dependencies are installed
COPY ./webapp /var/app/webapp
COPY ./interface /var/app/interface

# Build the application (this might generate big files, ensure you have enough space)
RUN yarn build

# Expose default port
EXPOSE 3000

# Start in dev mode
CMD ["yarn", "dev"]
