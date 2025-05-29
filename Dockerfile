FROM node:18-alpine AS builder

WORKDIR /tmp
COPY . .

# RUN npx prettier --check ./src
RUN npx prettier --write ./src
RUN npx update-browserslist-db@latest
RUN npm install -g npm@11.4.1
RUN yarn && yarn build 

###
# production image
FROM nginx:stable-alpine
COPY --from=builder /tmp/build /usr/share/nginx/html
