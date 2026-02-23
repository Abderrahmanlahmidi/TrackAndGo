#!/bin/sh
set -e

PORT="${PORT:-3000}"

exec json-server --host 0.0.0.0 --port "$PORT" --watch /app/db.json
