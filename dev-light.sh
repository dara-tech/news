#!/bin/bash

echo "🚀 Starting Lightweight Development Server"
echo "=========================================="

# Set memory limits
export NODE_OPTIONS="--max-old-space-size=1024 --max-semi-space-size=64"

# Disable source maps to save memory
export NEXT_DISABLE_SOURCEMAP=true

# Disable TypeScript checking in development
export NEXT_DISABLE_TYPESCRIPT_CHECK=true

# Start with minimal features
cd frontend
npm run dev -- --port 3000 --hostname 0.0.0.0
