import type { DocGenConfig } from '../../src/config';

const config : DocGenConfig = {
  includes: ['__tests__/treeBuilderFakeTestsRenames'],
  outputDirectory: './__tests__/docs/runSiteBuilderTests',
  describeFunctionNameOverride: 'describeProxy',
  testFunctionNameOverride: 'testProxy'
};

export default config;