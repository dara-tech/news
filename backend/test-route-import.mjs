console.log('🧪 Testing userLoginRoutes import...');

try {
  const userLoginRoutes = await import('./routes/userLogins.mjs');
  console.log('✅ userLoginRoutes imported successfully');
  console.log('Routes:', userLoginRoutes.default);
} catch (error) {
  console.error('❌ Error importing userLoginRoutes:', error.message);
  console.error('Stack:', error.stack);
} 