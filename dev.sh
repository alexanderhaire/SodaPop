#!/bin/bash

# Start frontend and backend in parallel with logs
echo "🚀 Starting SodaPop fullstack app..."

# Run backend
(cd backend && npm install && npm run dev) &

# Run frontend
(cd frontend && npm install && npm run dev) &

# Wait for both processes to finish (or Ctrl+C to stop)
wait
