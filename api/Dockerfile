ARG GO_VERSION=1.24.6

FROM golang:${GO_VERSION}-bookworm AS build

WORKDIR /src
COPY api/go.mod api/go.sum ./
RUN go mod download
COPY api/ ./
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/wish-api ./cmd/wish-api

FROM gcr.io/distroless/static-debian12:nonroot

COPY --from=build /out/wish-api /wish-api
EXPOSE 3001
USER nonroot:nonroot
ENTRYPOINT ["/wish-api"]
