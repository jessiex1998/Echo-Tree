export default {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  moduleFileExtensions: ['js', 'jsx'],
  transform: {},
  collectCoverageFrom: [
    'services/**/*.js',
    'routes/**/*.js',
    'utils/**/*.js',
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
};

