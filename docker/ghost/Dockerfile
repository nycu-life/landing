# Ghost owns session creation; the custom SSO adapter uses its supported hook.
FROM ghost:6.75.0-alpine
COPY docker/ghost/adapters/sso/NycuOneSSO/index.js /opt/nycu-adapters/sso/NycuOneSSO/index.js
COPY docker/ghost/adapters/sso/NycuOneSSO/package.json /opt/nycu-adapters/sso/NycuOneSSO/package.json
ENV paths__installedAdaptersPath=/opt/nycu-adapters
