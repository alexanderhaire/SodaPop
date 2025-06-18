#!/bin/bash

echo "🚀 Starting SodaPop fullstack app..."

check_port() {
  if lsof -i :$1 >/dev/null 2>&1; then
    echo "⚠️  Port $1 in use. Consider a different port." >&2
  fi
}

check_port 4000
check_port 5173

(cd backend && npm run dev) &
(cd frontend && npm run dev) &

wait
