# syntax=docker/dockerfile:1.10
ARG NODE_VERSION=24.22.1
ARG PNPM_VERSION=10.21.0
FROM node:${NODE_VERSION}-bookworm-slim AS build
ARG PNPM_VERSION
ARG PUBLIC_GA_ID
ENV PUBLIC_GA_ID=${PUBLIC_GA_ID}
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile
COPY . .
# Ghost site content is read at runtime in the deployed Node service.
# Builds need no CMS credentials or connection to Ghost.
RUN pnpm run build

FROM node:${NODE_VERSION}-bookworm-slim AS runtime
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000
WORKDIR /app
COPY --from=build --chown=node:node /app/build ./build
COPY --from=build --chown=node:node /app/package.json ./package.json
USER node
EXPOSE 3000
CMD ["node", "build"]
