# syntax=docker/dockerfile:1
FROM oven/bun:1-alpine AS builder

WORKDIR /app

COPY package.json bun.lockb* ./

COPY shared/package.json   ./shared/package.json
COPY frontend/package.json ./frontend/package.json

RUN bun install --frozen-lockfile

COPY shared   ./shared
COPY frontend ./frontend

RUN cd frontend && bun run build


# ── Runtime stage ──────────────────────────────────────────────────────────────
FROM dhi.io/nginx AS runtime

# React Router uses client-side routing — all requests must fall back to
# index.html so the router can handle the path, otherwise a hard refresh
# on /some/route returns a 404 from nginx.
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
