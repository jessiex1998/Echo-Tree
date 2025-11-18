import { jest } from '@jest/globals';

// Silence console.error during tests to reduce noise
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  console.error.mockRestore();
});

