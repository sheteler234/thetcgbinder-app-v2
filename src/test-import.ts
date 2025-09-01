// Test file to check import resolution
import type { ApiResponse } from './lib/types';

console.log('ApiResponse imported successfully');

// Create a test function that uses the type
const createTestResponse = (): ApiResponse<string> => ({
  data: 'test',
  message: 'success'
});

export { createTestResponse };
