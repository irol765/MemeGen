# Build Stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Arguments for build time (optional, as keys are mostly runtime or client-side)
ARG API_KEY
ARG ACCESS_CODE
ENV API_KEY=$API_KEY
ENV ACCESS_CODE=$ACCESS_CODE
RUN npm run build

# Production Stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Simple Nginx config for SPA fallback
RUN echo 'server { listen 80; root /usr/share/nginx/html; index index.html; location / { try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
