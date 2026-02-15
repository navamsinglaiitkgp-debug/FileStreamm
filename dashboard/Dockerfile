# ---- build stage ----
FROM node:20-alpine AS build
ARG VITE_API_BASE
ARG VITE_NOTIF_BASE
ARG VITE_GATEWAY_WS
ENV VITE_API_BASE=$VITE_API_BASE
ENV VITE_NOTIF_BASE=$VITE_NOTIF_BASE
ENV VITE_GATEWAY_WS=$VITE_GATEWAY_WS
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ---- run stage ----
FROM nginx:alpine

# Copy build output to nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Basic nginx config (optional, but helps SPA routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
