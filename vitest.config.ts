import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    coverage: {
      exclude: [
        '__tests__/helpers/**',
        'index.ts',
        'eslint.config.ts', 
        'vitest.config.ts',
        'src/index.ts',
        'build.js',
        'src/WebBuilder/Components/setupHtmlElement.ts',
        '**/node_modules/**',
        '**/**.config.**'
      ],
      excludeAfterRemap: true
    },
    exclude: [
      '__tests__/treeBuilderFakeTestsRename/**',
      '__tests__/treeBuilderFakeTests/**',
      'node_modules/**',
      '__tests__/cli.integration.test.ts'
    ],
    sequence: {
      concurrent: false
    }
  }
});