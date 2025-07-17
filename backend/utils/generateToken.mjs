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
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction, // Use secure in production
    sameSite: isProduction ? 'none' : 'lax', // Allow cross-site in production
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    domain: isProduction ? '.onrender.com' : undefined, // Allow subdomains in production
    path: '/',
  };
  
  console.log('Setting cookie with options:', {
    ...cookieOptions,
    token: token ? 'token-set' : 'no-token',
    environment: process.env.NODE_ENV
  });
  
  res.cookie('jwt', token, cookieOptions);

  return token;
};

export default generateToken;
