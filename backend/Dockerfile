FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

# Install all dependencies (including devDeps for tsx)
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Generate Prisma client
RUN npx prisma generate

EXPOSE 3001

# Use ; so server starts even if migration fails (e.g. DB not yet reachable)
CMD ["sh", "-c", "npx prisma migrate deploy; npx tsx src/server.ts"]
