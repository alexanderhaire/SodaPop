#!/bin/bash

echo "🔧 Installing backend dependencies..."
cd backend && npm install && cd ..

echo "🔧 Installing frontend dependencies..."
cd frontend && npm install && cd ..

echo "✅ Setup complete. Run ./dev.sh to start the fullstack app."
