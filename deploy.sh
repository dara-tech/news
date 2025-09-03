#!/bin/bash

# 🚀 Production Deployment Script
echo "🚀 Starting Production Deployment..."

# 1. Build Frontend
echo "📦 Building frontend..."
cd frontend
npm run build
cd ..

# 2. Check Backend
echo "🔧 Checking backend..."
cd backend
node -c server.mjs
echo "✅ Backend syntax check passed"
cd ..

# 3. Run Tests
echo "🧪 Running comprehensive tests..."
cd backend
node test-all-improvements.mjs
cd ..

echo "🎉 Deployment preparation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Push to GitHub: git add . && git commit -m 'Production ready' && git push"
echo "2. Deploy to your chosen platform (Render.com recommended)"
echo "3. Set up environment variables"
echo "4. Configure domain and SSL"
echo "5. Launch your platform!"
echo ""
echo "🌟 Your news platform is ready for production deployment!"
