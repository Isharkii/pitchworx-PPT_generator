FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Generate Prisma client (includes linux-musl-openssl-3.0.x binary for Alpine)
RUN npx prisma generate --no-hints

# Compile TypeScript to CJS with esbuild
RUN node_modules/.bin/esbuild src/server.ts \
  --bundle \
  --platform=node \
  --target=node20 \
  --format=cjs \
  --outfile=dist/server.cjs \
  --packages=external \
  --log-level=info

# Verify the file was created
RUN ls -lh dist/server.cjs

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.cjs 2>&1"]
