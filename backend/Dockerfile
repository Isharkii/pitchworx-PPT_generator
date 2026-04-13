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

ENV PATH="/app/node_modules/.bin:$PATH"

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy; tsx src/server.ts"]
