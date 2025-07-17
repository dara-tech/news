import jwt from 'jsonwebtoken';

const generateToken = (res, user) => {
  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE,
    }
  );

  // Set JWT as HTTP-Only cookie
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: isProduction, // Only send over HTTPS in production
    sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-site in production
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    domain: isProduction ? '.onrender.com' : undefined, // Allow subdomains in production
  });

  return token;
};

export default generateToken;
