#!/usr/bin/env sh
set -e

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
cd "$ROOT_DIR"

docker compose up -d --build
echo "Deploy complete. Web: http://localhost:3000  API: http://localhost:8080"
