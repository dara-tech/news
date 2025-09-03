import logger from '../utils/logger.mjs';
logger.info('🧪 Testing userLoginRoutes import...');

try {
  const userLoginRoutes = await import('./routes/userLogins.mjs');
  logger.info('✅ userLoginRoutes imported successfully');
  logger.info('Routes:', userLoginRoutes.default);
} catch (error) {
  logger.error('❌ Error importing userLoginRoutes:', error.message);
  logger.error('Stack:', error.stack);
} 