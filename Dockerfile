FROM node:23.10.0-alpine

WORKDIR /usr/src/app

# Install system dependencies
RUN apk add --no-cache openssl
RUN npm install -g pnpm@9.13.0

# Copy package files and prisma schema
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client
RUN pnpm exec prisma generate

# Build the application
RUN pnpm run build

# Copy production environment
COPY .env.production .env

USER node

EXPOSE 3000
CMD ["sh", "-c", "pnpm prisma migrate deploy && pnpm start"]
