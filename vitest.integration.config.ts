import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/cli.integration.test.ts'],  // only include your integration tests
    exclude: ['node_modules/**'],
    sequence: {
      concurrent: false
    }
  }
});