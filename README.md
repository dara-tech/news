# News Platform

A modern, multilingual news platform with AI-powered content management and real-time features.

## 🚀 Features

- **Multilingual Support**: English and Khmer (Khmer)
- **AI-Powered Content**: Automatic content generation, translation, and enhancement
- **Real-time Features**: Live comments, notifications, and analytics
- **Admin Dashboard**: Comprehensive content and user management
- **Social Media Integration**: Auto-posting to multiple platforms
- **Performance Optimized**: Caching, image optimization, and CDN ready

## 📁 Project Structure

```
├── backend/                 # Node.js API server
│   ├── routes/             # API routes
│   ├── models/             # Database models
│   ├── controllers/        # Business logic
│   ├── middleware/         # Express middleware
│   ├── services/           # Business services
│   ├── utils/              # Utility functions
│   └── server.mjs          # Main server file
├── frontend/               # Next.js React application
│   ├── src/app/           # App router pages
│   ├── src/components/    # React components
│   ├── src/hooks/         # Custom hooks
│   ├── src/lib/           # Utility libraries
│   └── src/types/         # TypeScript types
└── scripts/               # Utility scripts
```

## 🛠️ Development

### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🚀 Deployment

The platform is deployed on:
- **Backend**: Render.com
- **Frontend**: Local development (can be deployed to Vercel/Netlify)

## 📊 Current Status

- **Articles**: 56 total, 13 published
- **Views**: 184 total views
- **Languages**: English and Khmer
- **Features**: AI content, real-time analytics, social media integration

## 🔧 Configuration

Environment variables are configured in the deployment platform. Key variables include:
- `MONGODB_URI`: Database connection
- `GOOGLE_API_KEY`: AI services
- Social media tokens for auto-posting

## 📝 License

Private project - All rights reserved.
