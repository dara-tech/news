#!/bin/bash

echo "🚀 Memory Optimization Script for Mac"
echo "====================================="

# Check current memory usage
echo "📊 Current Memory Usage:"
top -l 1 | grep -E "PhysMem|Swap"

echo ""
echo "🧹 Cleaning up development files..."

# Stop any running development servers
echo "⏹️  Stopping development servers..."
pkill -f "next dev" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true

# Clear Next.js cache
echo "🗑️  Clearing Next.js cache..."
rm -rf .next 2>/dev/null || true
rm -rf frontend/.next 2>/dev/null || true

# Clear node_modules cache
echo "🗑️  Clearing node_modules cache..."
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf frontend/node_modules/.cache 2>/dev/null || true

# Clear npm cache
echo "🗑️  Clearing npm cache..."
npm cache clean --force 2>/dev/null || true

# Clear system caches (safe)
echo "🧹 Clearing system caches..."
sudo purge 2>/dev/null || echo "⚠️  Could not clear system caches (may need sudo password)"

# Clear browser caches (if Chrome is running)
echo "🌐 Clearing browser caches..."
osascript -e 'tell application "Google Chrome" to quit' 2>/dev/null || true
rm -rf ~/Library/Caches/Google/Chrome/Default/Cache 2>/dev/null || true

# Clear temporary files
echo "🗑️  Clearing temporary files..."
rm -rf /tmp/next-* 2>/dev/null || true
rm -rf ~/.npm/_cacache 2>/dev/null || true

# Restart development server with memory limits
echo "🚀 Starting development server with memory optimization..."
cd frontend

# Set Node.js memory limits
export NODE_OPTIONS="--max-old-space-size=2048 --max-semi-space-size=128"

# Start development server in background
npm run dev &

echo ""
echo "✅ Memory optimization complete!"
echo "📊 New Memory Usage:"
top -l 1 | grep -E "PhysMem|Swap"

echo ""
echo "💡 Additional Tips:"
echo "   - Close unnecessary browser tabs"
echo "   - Close unused applications"
echo "   - Restart your Mac if memory is still low"
echo "   - Consider upgrading RAM if this is a persistent issue"
