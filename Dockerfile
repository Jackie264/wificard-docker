# Stage 1: Builder
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --immutable

# Debug 1: Confirm yarn install ran successfully (check if node_modules exists)
RUN ls -la node_modules/

# Debug 2: List contents of .bin to see if vite is there
RUN ls -la node_modules/.bin/

# Debug 3: Print the PATH environment variable
RUN echo $PATH

# Debug 4: Print the result of yarn bin
RUN echo "Yarn bin path: $(yarn bin)"

# Debug 5: Attempt to run vite using its *absolute path* to confirm it's executable
RUN /app/node_modules/.bin/vite --version || echo "Vite not directly executable at absolute path"

# --- DEBUGGING STEPS END HERE ---

COPY . .

RUN yarn run build
# 或者 RUN PATH=$(yarn bin):$PATH vite build

# Stage 2: Production
FROM nginx:stable-alpine

COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
