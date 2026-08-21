# Mercury Dasha Makefile (Justin Andrew Wood)

.PHONY: all dev build run test clean export-ui

all: build

# Build Next.js static export into frontend/out
export-ui:
	@echo "Building Next.js static UI export..."
	cd frontend && pnpm build

# Compile singular unified Go binary with embedded UI
build: export-ui
	@echo "Compiling singular unified Mercury Dasha binary..."
	go build -ldflags="-s -w" -o mercury-dasha-server .
	@echo "✅ Singular unified binary ready at ./mercury-dasha-server"

# Run singular binary on port 3000 (serving both UI and API)
run:
	./mercury-dasha-server -port 3000

# Live development mode (Go on :8080, Next.js dev on :3000)
dev:
	./start.sh

# Clean build artifacts
clean:
	rm -f mercury-dasha-server
	rm -rf frontend/out frontend/.next
