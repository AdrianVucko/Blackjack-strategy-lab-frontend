# syntax=docker/dockerfile:1

# ---- Build stage: compile the app with Node ----
FROM node:24-alpine AS build
WORKDIR /app

# Backend origin is inlined by Vite at build time (VITE_* vars are compile-time).
# Default to the same-origin /api path served by the nginx reverse proxy below.
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Install deps against the lockfile first so this layer is cached until deps change.
COPY package.json package-lock.json ./
RUN npm ci

# Then copy sources and build the static bundle into /app/dist.
COPY . .
RUN npm run build

# ---- Runtime stage: serve the static files with nginx ----
FROM nginx:1.27-alpine AS runtime

# Where /api requests are proxied. Overridable at `docker run` (runtime, not build):
#   -e BACKEND_URL=http://host.docker.internal:8000
ENV BACKEND_URL=http://host.docker.internal:8000

# The nginx image runs envsubst on templates here, writing to /etc/nginx/conf.d/.
COPY default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
