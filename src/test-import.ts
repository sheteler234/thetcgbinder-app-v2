// Test file to check import resolution
import { ApiResponse } from './lib/types';

console.log('ApiResponse imported successfully:', typeof ApiResponse);

export const testApiResponse: ApiResponse<string> = {
  data: 'test',
  message: 'success'
};
