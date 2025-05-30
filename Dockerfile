FROM node:22-alpine AS builder

WORKDIR /tmp
COPY . .

RUN npm install -g npm@11.4.1
RUN npm install -g prettier@3.5.3
RUN npx prettier --write ./src
RUN npx update-browserslist-db@1.1.3
RUN yarn && yarn build 

# production image
FROM nginx:stable-alpine
COPY --from=builder /tmp/build /usr/share/nginx/html
