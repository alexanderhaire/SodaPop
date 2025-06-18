#!/bin/bash

echo "🔧 Installing backend dependencies..."
cd backend && npm install && cd ..

echo "🔧 Installing frontend dependencies..."
cd frontend && npm install && cd ..

missing=()
for key in OPENAI_API_KEY ALCHEMY_API_URL; do
  if ! grep -q "^$key=" .env 2>/dev/null; then
    missing+=("$key")
  fi
done

if [ ${#missing[@]} -gt 0 ]; then
  echo "⚠️  Missing keys in .env: ${missing[*]}"
fi

echo "✅ Setup complete. Run ./dev.sh to start the fullstack app."
