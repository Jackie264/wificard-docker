# Stage 1: Builder
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./

# 移除 --no-bin-links 选项，允许 Yarn 创建二进制链接
RUN yarn install --immutable # <--- 关键修改点

# --- DEBUGGING STEPS (保持，但这次它们应该能通过) ---

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

# 重新启用正常的构建命令
# 现在 node_modules/.bin/ 应该存在，并且 vite 应该能被找到
RUN yarn run build # 或者 RUN PATH=$(yarn bin):$PATH vite build

# Stage 2: Production
FROM nginx:stable-alpine

COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
