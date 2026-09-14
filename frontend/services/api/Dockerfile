# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY services/api/package.json services/api/
COPY packages ./packages

RUN pnpm install --frozen-lockfile

COPY services/api ./services/api
COPY tsconfig.base.json ./

RUN pnpm --filter @nafi/api build
RUN pnpm --filter @nafi/api prisma:generate

FROM node:20-alpine AS runtime
WORKDIR /app
RUN apk add --no-cache tini curl
RUN corepack enable
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/services/api/dist ./dist
COPY --from=builder /app/services/api/package.json ./
COPY --from=builder /app/services/api/prisma ./prisma

EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -fs http://localhost:4000/api/v1/health || exit 1

USER node
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/server.js"]
