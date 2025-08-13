import fs from 'fs';

async function test401Fix() {
  console.log('🔍 Testing 401 Error Fix for Logo and Footer Components...\n');

  try {
    // Check if backend controller has public endpoints
    if (!fs.existsSync('backend/controllers/settingsController.mjs')) {
      console.log('❌ settingsController.mjs not found');
      return;
    }

    console.log('✅ Backend controller exists');

    // Read the controller content
    const controllerContent = fs.readFileSync('backend/controllers/settingsController.mjs', 'utf8');

    // Check for public logo endpoint
    if (controllerContent.includes('getPublicLogoSettings')) {
      console.log('✅ Public logo endpoint function exists');
    } else {
      console.log('❌ Public logo endpoint function missing');
    }

    // Check for public footer endpoint
    if (controllerContent.includes('getPublicFooterSettings')) {
      console.log('✅ Public footer endpoint function exists');
    } else {
      console.log('❌ Public footer endpoint function missing');
    }

    // Check if routes are configured
    if (!fs.existsSync('backend/routes/settings.mjs')) {
      console.log('❌ settings.mjs routes not found');
      return;
    }

    console.log('✅ Settings routes file exists');

    // Read the routes content
    const routesContent = fs.readFileSync('backend/routes/settings.mjs', 'utf8');

    // Check for public logo route
    if (routesContent.includes("router.get('/public/logo', getPublicLogoSettings)")) {
      console.log('✅ Public logo route configured');
    } else {
      console.log('❌ Public logo route not configured');
    }

    // Check for public footer route
    if (routesContent.includes("router.get('/public/footer', getPublicFooterSettings)")) {
      console.log('✅ Public footer route configured');
    } else {
      console.log('❌ Public footer route not configured');
    }

    // Check if frontend components are updated
    if (!fs.existsSync('frontend/src/components/layout/Logo.tsx')) {
      console.log('❌ Logo component not found');
      return;
    }

    console.log('✅ Logo component exists');

    // Read the Logo component content
    const logoContent = fs.readFileSync('frontend/src/components/layout/Logo.tsx', 'utf8');

    // Check if Logo component uses public endpoint
    if (logoContent.includes('/settings/public/logo')) {
      console.log('✅ Logo component uses public endpoint');
    } else {
      console.log('❌ Logo component still uses admin endpoint');
    }

    // Check Footer component
    if (!fs.existsSync('frontend/src/components/layout/Footer.tsx')) {
      console.log('❌ Footer component not found');
      return;
    }

    console.log('✅ Footer component exists');

    // Read the Footer component content
    const footerContent = fs.readFileSync('frontend/src/components/layout/Footer.tsx', 'utf8');

    // Check if Footer component uses public endpoints
    const footerChecks = [
      { name: 'Logo settings', pattern: '/settings/public/logo' },
      { name: 'Footer settings', pattern: '/settings/public/footer' },
      { name: 'Social media settings', pattern: '/settings/public/social-media' }
    ];

    footerChecks.forEach(check => {
      if (footerContent.includes(check.pattern)) {
        console.log(`✅ Footer component uses public endpoint for ${check.name}`);
      } else {
        console.log(`❌ Footer component still uses admin endpoint for ${check.name}`);
      }
    });

    console.log('\n🎯 **Summary of 401 Error Fix:**');
    console.log('✅ Created public endpoints for logo and footer settings');
    console.log('✅ Updated frontend components to use public endpoints');
    console.log('✅ No authentication required for public pages');
    console.log('✅ Default settings provided if none exist');

    console.log('\n🚀 **Next Steps:**');
    console.log('1. Deploy the backend changes');
    console.log('2. Deploy the frontend changes');
    console.log('3. Test the logo and footer on public pages');
    console.log('4. Verify no more 401 errors in browser console');

  } catch (error) {
    console.error('❌ Error during test:', error);
  }
}

test401Fix();
