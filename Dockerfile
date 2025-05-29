FROM node:22-alpine AS builder

WORKDIR /tmp
COPY . .

# RUN npx prettier --check ./src
RUN npx prettier --write ./src
RUN npx update-browserslist-db@latest
RUN yarn && yarn build 

###
# production image
FROM nginx:stable-alpine
COPY --from=builder /tmp/build /usr/share/nginx/html
