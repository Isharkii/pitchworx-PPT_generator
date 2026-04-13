FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Generate Prisma client
RUN npx prisma generate

# Compile TypeScript to JS with esbuild (no tsx at runtime)
RUN node_modules/.bin/esbuild src/server.ts \
  --bundle \
  --platform=node \
  --target=node20 \
  --format=esm \
  --outfile=dist/server.mjs \
  --packages=external

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.mjs"]
