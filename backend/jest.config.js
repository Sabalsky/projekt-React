/** Konfiguracja Jest dla ESM (Node >= 22). Uruchamiane przez npm test. */
export default {
  testEnvironment: 'node',
  transform: {}, // brak transpilacji - natywne ESM
  testMatch: ['**/tests/**/*.test.js'],
  setupFiles: ['<rootDir>/tests/setupEnv.js'],
  verbose: true,
};
