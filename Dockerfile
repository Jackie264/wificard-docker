FROM node:22-alpine AS builder

WORKDIR /tmp
COPY package.json yarn.lock ./
RUN yarn install --immutable --no-bin-links
COPY . .
RUN npx update-browserslist-db@latest
RUN yarn build 
FROM nginx:stable-alpine
COPY --from=builder /tmp/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
