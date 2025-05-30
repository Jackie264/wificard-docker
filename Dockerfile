# Stage 1: Builder
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./

# Step 1: Install dependencies
RUN yarn install --immutable --no-bin-links

# --- DEBUGGING STEPS START HERE ---

# Debug 1: Confirm yarn install ran successfully (check if node_modules exists)
RUN ls -la node_modules/

# Debug 2: List contents of .bin to see if vite is there
RUN ls -la node_modules/.bin/

# Debug 3: Print the PATH environment variable
RUN echo $PATH

# Debug 4: Print the result of yarn bin
RUN echo "Yarn bin path: $(yarn bin)"

# Debug 5: Attempt to run vite using its *absolute path* to confirm it's executable
# This is the most direct test.
# If this fails, it means vite binary itself isn't installed or is corrupted.
RUN /app/node_modules/.bin/vite --version || echo "Vite not directly executable at absolute path"

# --- DEBUGGING STEPS END HERE ---

COPY . . # Copy remaining project files (this step will be skipped if debugging fails before this)

# The problematic build command - we will re-enable after debugging
# RUN PATH=$(yarn bin):$PATH vite build

# For now, let's just make sure the debugging steps run without immediately failing
# We'll put a placeholder command here to let the build complete for debugging output
RUN echo "Debugging steps completed. Check logs above."

# Stage 2: Production
FROM nginx:stable-alpine

COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
