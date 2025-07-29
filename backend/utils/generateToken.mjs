import jwt from 'jsonwebtoken';

const generateToken = (res, user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('Server configuration error');
  }

  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '30d',
    }
  );

  // Set JWT as HTTP-Only cookie
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction, // Only send over HTTPS in production
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: '/',
  };

  // Configure for production
  if (isProduction) {
    // Remove domain restriction to allow cross-domain cookies
    // cookieOptions.domain = '.onrender.com'; // This was causing the issue
    cookieOptions.sameSite = 'none';
    cookieOptions.secure = true;
  }


  res.cookie('jwt', token, cookieOptions);
  return token;
};

export default generateToken;
