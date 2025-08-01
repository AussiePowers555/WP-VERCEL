#!/bin/bash

# WhitePointer Application Startup Script

echo "🚀 Starting WhitePointer Motorcycle Rental Management System..."

# Check if we're in Replit environment
if [ -n "$REPL_SLUG" ]; then
  echo "📡 Running in Replit environment"
  export NODE_ENV=production
  export FRONTEND_URL="https://${REPL_SLUG}.${REPL_OWNER}.repl.co"
else
  echo "💻 Running in local development environment"
  export NODE_ENV=development
  export FRONTEND_URL="http://localhost:3000"
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "backend/node_modules" ]; then
  echo "📦 Installing backend dependencies..."
  cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
  echo "📦 Installing frontend dependencies..."
  cd frontend && npm install && cd ..
fi

# Build frontend for production
if [ "$NODE_ENV" = "production" ]; then
  echo "🔨 Building frontend for production..."
  cd frontend && npm run build && cd ..
fi

# Start the application
echo "🎯 Starting application..."
npm start