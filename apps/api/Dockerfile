FROM node:lts-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS turbo-cli
RUN pnpm add -g turbo

FROM turbo-cli AS builder
WORKDIR /app
COPY . .
RUN turbo prune @cograde/api --docker

FROM base AS installer
WORKDIR /app

COPY --from=builder /app/out/json/ .
RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/out/full/ .

FROM installer AS runner

ENV NODE_ENV=production
ENV PORT=3333
ENV HOSTNAME="0.0.0.0"

EXPOSE 3333

ENTRYPOINT ["pnpm", "start"]
