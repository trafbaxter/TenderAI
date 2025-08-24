# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package.json ./

# Copy yarn.lock if it exists, otherwise this step will be skipped
COPY yarn.loc[k] ./

# Install dependencies - use yarn if yarn.lock exists, otherwise use npm
RUN if [ -f yarn.lock ]; then \
      echo "Using yarn with yarn.lock" && \
      yarn install --frozen-lockfile; \
    else \
      echo "Using npm (no yarn.lock found)" && \
      npm ci; \
    fi

# Copy source code
COPY . .

# Build the application - use same package manager as install
RUN if [ -f yarn.lock ]; then \
      yarn build; \
    else \
      npm run build; \
    fi

# Production stage
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application
COPY --from=build /app/build /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]