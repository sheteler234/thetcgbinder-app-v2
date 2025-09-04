// Quick test to verify logo URL generation
import.meta = { env: { DEV: true } };

// Helper functions (copied from emailService.ts)
const getLogoUrl = () => {
  const isDev = import.meta.env.DEV;
  return isDev ? 'http://localhost:5175/logo-white.png' : 'https://thetcgbinder.com/logo-white.png';
};

const getBaseUrl = () => {
  const isDev = import.meta.env.DEV;
  return isDev ? 'http://localhost:5175' : 'https://thetcgbinder.com';
};

console.log('Development Environment:');
console.log('Logo URL:', getLogoUrl());
console.log('Base URL:', getBaseUrl());

// Test production
import.meta.env.DEV = false;
console.log('\nProduction Environment:');
console.log('Logo URL:', getLogoUrl());
console.log('Base URL:', getBaseUrl());
