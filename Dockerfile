# ---- Builder ----
FROM node:20-bookworm-slim AS builder

RUN apt-get update -qq && apt-get install -y -qq openssl > /dev/null 2>&1

RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/
COPY apps/mobile/package.json ./apps/mobile/
COPY packages/db/package.json ./packages/db/
COPY packages/shared/package.json ./packages/shared/

RUN pnpm install --frozen-lockfile

COPY . .

# Switch Prisma schema to Postgres before generating the client
RUN cp packages/db/prisma/schema.postgres.prisma packages/db/prisma/schema.prisma

RUN pnpm run db:generate
ENV DATABASE_URL=postgresql://localhost:5432/build_placeholder
RUN pnpm run web:build

# ---- Runtime ----
FROM node:20-bookworm-slim AS runtime

RUN apt-get update -qq && apt-get install -y -qq openssl curl > /dev/null 2>&1 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static

# DB package: schema + seed script + shared dependency
COPY --from=builder /app/packages/db/prisma/schema.postgres.prisma ./packages/db/prisma/schema.prisma
COPY --from=builder /app/packages/db/prisma/seed.ts ./packages/db/prisma/seed.ts
COPY --from=builder /app/packages/db/package.json ./packages/db/package.json
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/db/node_modules ./packages/db/node_modules

COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Install CLI tools needed by the entrypoint (pnpm symlinks don't survive COPY)
RUN npm install -g prisma@5.22.0 tsx@4

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

EXPOSE 3000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "apps/web/server.js"]
