FROM node:20.11-bookworm AS builder

WORKDIR /var/app/webapp

# Copy package files and config first
COPY ./webapp/package.json ./webapp/yarn.lock ./webapp/tsconfig.json ./

# Install dependencies with cache cleanup
RUN yarn install --frozen-lockfile && yarn cache clean

# Copy source files
COPY ./webapp /var/app/webapp
COPY ./interface /var/app/interface

# Verify source files
RUN ls -la /var/app/webapp/src/api/

# Build the application
RUN yarn build

# Production image
FROM node:20.11-bookworm-slim

WORKDIR /var/app/webapp

# Copy only necessary files from builder
COPY --from=builder /var/app/webapp/package.json ./
COPY --from=builder /var/app/webapp/yarn.lock ./
COPY --from=builder /var/app/webapp/.next ./.next
COPY --from=builder /var/app/webapp/node_modules ./node_modules
COPY --from=builder /var/app/webapp/public ./public

EXPOSE 3000

CMD ["yarn", "dev"]
