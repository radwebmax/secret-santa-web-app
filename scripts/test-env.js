require('dotenv').config();

console.log('Testing .env file loading...\n');
console.log('REGISTRATION_PASSWORD value:', process.env.REGISTRATION_PASSWORD || '(not set)');
console.log('REGISTRATION_PASSWORD length:', (process.env.REGISTRATION_PASSWORD || '').length);
console.log('REGISTRATION_PASSWORD type:', typeof process.env.REGISTRATION_PASSWORD);

if (process.env.REGISTRATION_PASSWORD) {
  console.log('\nCharacter codes:');
  process.env.REGISTRATION_PASSWORD.split('').forEach((char, index) => {
    console.log(`  [${index}]: '${char}' (code: ${char.charCodeAt(0)})`);
  });
} else {
  console.log('\n⚠️  REGISTRATION_PASSWORD is not set in environment variables!');
  console.log('Make sure your .env file:');
  console.log('  1. Exists in the root directory');
  console.log('  2. Contains: REGISTRATION_PASSWORD=your-password');
  console.log('  3. Has no spaces around the = sign');
  console.log('  4. Has no quotes around the value');
}

