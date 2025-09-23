# 📧 Email Setup Guide for Password Reset

## Quick Setup (Recommended)

### Step 1: Create Gmail App Password

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click **Security** → **2-Step Verification** (enable if not already)
3. Go back to **Security** → **App passwords**
4. Select **Mail** → **Other (Custom name)**
5. Enter "Razewire Password Reset"
6. Click **Generate**
7. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

### Step 2: Add to Backend .env File

Create or update `/backend/.env` with:

```env
# Gmail SMTP Configuration
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_16_character_app_password

# Other existing variables...
MONGO_URI=mongodb://localhost:27017/razewire
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=30d
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Step 3: Restart Backend Server

```bash
cd backend
npm run dev
```

## Alternative: Use Your Own SMTP

If you prefer a different email service, update the email service configuration:

```env
# Custom SMTP
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your_email@yourdomain.com
SMTP_PASS=your_password
FROM_EMAIL=noreply@yourdomain.com
```

## Testing

1. Go to `/en/forgot-password`
2. Enter your email address
3. Check your email inbox for the reset link
4. Click the link to reset your password

## Troubleshooting

- **"Invalid credentials"**: Check your Gmail app password
- **"Connection timeout"**: Check your internet connection
- **"User not found"**: Make sure the email exists in your database

## Security Notes

- Never commit your `.env` file to version control
- Use app passwords, not your main Gmail password
- Consider using a dedicated email address for your app
