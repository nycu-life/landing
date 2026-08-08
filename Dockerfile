ARG NODE_VERSION=24.16.0
ARG PNPM_VERSION=10.21.0

FROM node:${NODE_VERSION}-bookworm-slim AS build
ARG PNPM_VERSION

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

COPY . .
# The image is served at its own domain root, so the SvelteKit base path stays
# empty.
RUN pnpm run build

FROM nginx:1.27-alpine AS runtime

COPY --from=build /app/build /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000
