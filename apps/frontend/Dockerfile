FROM node:lts-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS turbo-cli
RUN pnpm add -g turbo

FROM turbo-cli AS builder
WORKDIR /app
COPY . .
RUN turbo prune @cograde/frontend --docker

FROM base AS installer
WORKDIR /app
COPY --from=builder /app/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=builder /app/out/full/ .

RUN pnpm add -g turbo
RUN pnpm turbo run build --filter=@cograde/frontend

FROM nginx:alpine AS runner
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=installer /app/apps/frontend/dist .

EXPOSE 80

ENTRYPOINT ["nginx", "-g", "daemon off;"]
