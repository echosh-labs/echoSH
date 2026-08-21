# Stage 1: Build the Next.js static UI export
FROM node:22-alpine AS build-frontend
WORKDIR /src/frontend
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY frontend/package.json frontend/pnpm-lock.yaml* frontend/package-lock.json* ./
RUN if [ -f pnpm-lock.yaml ]; then pnpm install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    else npm install; fi
COPY frontend/ ./
RUN if [ -f pnpm-lock.yaml ]; then pnpm build; \
    else npm run build; fi

# Stage 2: Build the Go singular binary with embedded UI & Archive
FROM golang:1.24-alpine AS build-backend
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
# Copy built static frontend from Stage 1 into frontend/out
COPY --from=build-frontend /src/frontend/out ./frontend/out
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o mercury-dasha-server .

# Stage 3: Minimal runtime image
FROM alpine:latest
RUN apk --no-cache add ca-certificates tzdata
WORKDIR /app

# Copy binary and baseline files
COPY --from=build-backend /app/mercury-dasha-server /app/mercury-dasha-server
COPY mercury_foundational_statement.txt /app/mercury_foundational_statement.txt
RUN mkdir -p /app/data

# Cloud Run defaults
ENV PORT=8080
EXPOSE 8080

CMD ["/app/mercury-dasha-server", "-port", "8080", "-db", "/app/data/mercury_context.db"]

