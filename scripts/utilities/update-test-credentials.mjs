import fs from 'fs';

// Read the test file
const testFile = 'test-manual-features.mjs';
let content = fs.readFileSync(testFile, 'utf8');

// Replace all instances of the old credentials with the correct ones
content = content.replace(/email: 'user@test\.com'/g, "email: 'admin@example.com'");
content = content.replace(/password: 'user123'/g, "password: '123456'");

// Write the updated content back
fs.writeFileSync(testFile, content);

console.log('✅ Updated test credentials in test-manual-features.mjs');
console.log('Now using admin@example.com / 123456 for all tests'); 