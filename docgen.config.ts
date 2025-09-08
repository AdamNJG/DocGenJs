import { DocGenConfig } from './src/config';

const config: DocGenConfig = {
  includes: ['__tests__'],
  excludes: [
    '__tests__/configs/**', 
    '__tests__/fakeComponents/**', 
    '__tests__/helpers/**', 
    '__tests__/treeBuilderFakeTests/**', 
    '__tests__/treeBuilderFakeTestsRenames/**'
  ]
};

export default config;