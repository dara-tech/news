console.log('🧪 Testing module imports...');

try {
  console.log('1. Testing UserLogin model...');
  const UserLogin = await import('./models/UserLogin.mjs');
  console.log('✅ UserLogin model imported');

  console.log('2. Testing geoLocation utility...');
  const geoLocation = await import('./utils/geoLocation.mjs');
  console.log('✅ geoLocation utility imported');

  console.log('3. Testing userLoginController...');
  const userLoginController = await import('./controllers/userLoginController.mjs');
  console.log('✅ userLoginController imported');

  console.log('4. Testing userLogins routes...');
  const userLoginsRoutes = await import('./routes/userLogins.mjs');
  console.log('✅ userLogins routes imported');

  console.log('5. Testing server...');
  const server = await import('./server.mjs');
  console.log('✅ Server imported');

  console.log('\n✅ All imports successful!');
} catch (error) {
  console.error('❌ Import error:', error.message);
  console.error('Stack:', error.stack);
} 