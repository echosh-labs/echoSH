# Mercury Dasha Makefile (Justin Andrew Wood)

.PHONY: all build dev run test clean

all: build

# Build static presentation shell and singular Go binary
build:
	@bash scripts/build.sh

# Run live development mode (Go on :8080 + Next.js hot-reload on :3000)
dev:
	@bash scripts/dev.sh

# Execute automated HTTP assertion test suite
test:
	@bash scripts/test.sh

# Run standalone singular binary on port 3000
run:
	./mercury-dasha-server -port 3000

# Clean stale processes and build artifacts
clean:
	@bash scripts/clean.sh

# Ingest directive into Axis Mundi
axismundi-send:
	@bash scripts/axismundi.sh send "$(NOTE)"

# List Axis Mundi directives
axismundi-list:
	@bash scripts/axismundi.sh list

