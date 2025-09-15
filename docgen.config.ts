import type { DocGenConfig } from './dist/config';

const config : DocGenConfig = {
  includes: ['__tests__'],
  excludes: [
    '__tests__/configs/**', 
    '__tests__/fakeComponents/**', 
    '__tests__/helpers/**', 
    '__tests__/treeBuilderFakeTests/**',
    '__tests__/treeBuilderFakeTestsRenames/**',
    '__tests__/no_template/**'
  ]
};

export default config;