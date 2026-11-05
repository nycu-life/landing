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

# Comics content (docs/ghost.md) is read from Ghost while prerendering. Without
# GHOST_URL + the secret the build falls back to placeholder episodes, unless
# GHOST_REQUIRED=1. GHOST_URL is not sensitive; the Content API key is passed as a
# BuildKit secret (`--secret id=ghost_content_api_key,...`): it exists only for
# this RUN, never in an ENV/ARG, layer, image history or the GHA layer cache.
# CONTENT_REVISION busts that layer cache per build: secrets are not part of the
# cache key, so a Ghost-publish rebuild would otherwise reuse stale output.
ARG GHOST_URL=
ARG GHOST_REQUIRED=
ARG CONTENT_REVISION=
# The image is served at its own domain root, so the SvelteKit base path stays
# empty.
RUN --mount=type=secret,id=ghost_content_api_key,env=GHOST_CONTENT_API_KEY \
	echo "content revision: ${CONTENT_REVISION:-none}" && \
	GHOST_URL="${GHOST_URL}" GHOST_REQUIRED="${GHOST_REQUIRED}" pnpm run build

# Only the static output is copied: no Node, sources, args or secrets reach the
# runtime image (the build stage is discarded).
FROM nginx:1.30.6-alpine AS runtime

COPY --from=build /app/build /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000
