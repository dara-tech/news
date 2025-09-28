#!/bin/bash

echo "🔥 AGGRESSIVE Memory Cleanup"
echo "============================"

# Kill all Node.js processes
echo "💀 Killing all Node.js processes..."
pkill -f node 2>/dev/null || true
pkill -f npm 2>/dev/null || true
pkill -f next 2>/dev/null || true

# Wait a moment
sleep 2

# Clear ALL caches
echo "🗑️  Clearing ALL caches..."
rm -rf .next 2>/dev/null || true
rm -rf frontend/.next 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf frontend/node_modules/.cache 2>/dev/null || true
rm -rf ~/.npm/_cacache 2>/dev/null || true
rm -rf /tmp/next-* 2>/dev/null || true
rm -rf /tmp/npm-* 2>/dev/null || true

# Clear browser caches
echo "🌐 Clearing browser caches..."
osascript -e 'tell application "Google Chrome" to quit' 2>/dev/null || true
osascript -e 'tell application "Safari" to quit' 2>/dev/null || true
rm -rf ~/Library/Caches/Google/Chrome/Default/Cache 2>/dev/null || true
rm -rf ~/Library/Caches/com.apple.Safari 2>/dev/null || true

# Clear system caches
echo "🧹 Clearing system caches..."
sudo purge 2>/dev/null || echo "⚠️  Could not clear system caches"

# Check memory after cleanup
echo "📊 Memory after cleanup:"
top -l 1 | grep -E "PhysMem|Swap"

echo ""
echo "🚀 Starting ULTRA lightweight server..."

cd frontend

# Ultra low memory settings
export NODE_OPTIONS="--max-old-space-size=512 --max-semi-space-size=32"
export NEXT_DISABLE_SOURCEMAP=true
export NEXT_DISABLE_TYPESCRIPT_CHECK=true
export NODE_ENV=development

# Start with absolute minimum
npm run dev -- --port 3000 --hostname 0.0.0.0
