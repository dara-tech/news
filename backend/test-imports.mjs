import logger from '../utils/logger.mjs';
logger.info('🧪 Testing module imports...');

try {
  logger.info('1. Testing UserLogin model...');
  const UserLogin = await import('./models/UserLogin.mjs');
  logger.info('✅ UserLogin model imported');

  logger.info('2. Testing geoLocation utility...');
  const geoLocation = await import('./utils/geoLocation.mjs');
  logger.info('✅ geoLocation utility imported');

  logger.info('3. Testing userLoginController...');
  const userLoginController = await import('./controllers/userLoginController.mjs');
  logger.info('✅ userLoginController imported');

  logger.info('4. Testing userLogins routes...');
  const userLoginsRoutes = await import('./routes/userLogins.mjs');
  logger.info('✅ userLogins routes imported');

  logger.info('5. Testing server...');
  const server = await import('./server.mjs');
  logger.info('✅ Server imported');

  logger.info('\n✅ All imports successful!');
} catch (error) {
  logger.error('❌ Import error:', error.message);
  logger.error('Stack:', error.stack);
} 