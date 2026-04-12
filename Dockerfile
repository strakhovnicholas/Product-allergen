FROM node:20 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# production web export
RUN npx expo export -p web


FROM nginx:alpine

# Expo обычно кладёт web билд сюда
COPY --from=build /app/dist /usr/share/nginx/html

# nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]