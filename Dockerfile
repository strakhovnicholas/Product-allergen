FROM node:20-alpine AS build

WORKDIR /app

ENV CI=1

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .

# Build static web bundle for Expo Router app
RUN npx expo export --platform web --output-dir dist


FROM nginx:1.27-alpine AS runtime

# Serve static web build
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

ENTRYPOINT ["/usr/sbin/nginx", "-g", "daemon off;"]