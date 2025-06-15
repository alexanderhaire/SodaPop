#!/bin/bash

echo "🚀 Starting SodaPop fullstack app..."

# Run both frontend and backend in parallel
(cd backend && npm run dev) &
(cd frontend && npm run dev) &

# Wait for both processes
wait
