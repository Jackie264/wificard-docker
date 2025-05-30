FROM node:22-alpine AS builder

WORKDIR /tmp
COPY package.json yarn.lock ./

RUN yarn install --immutable --no-bin-links
RUN yarn prepare
COPY . .

# RUN npm install -g npm@11.4.1
# RUN npm install -g prettier@3.5.3
# RUN npx prettier --write ./src
# RUN npm install -g update-browserslist-db@1.1.3
# RUN npm install -g browserslist@4.25.0
RUN npx update-browserslist-db@latest
RUN yarn build 

# production image
FROM nginx:stable-alpine
COPY --from=builder /tmp/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
