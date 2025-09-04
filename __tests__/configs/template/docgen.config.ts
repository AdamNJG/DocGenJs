import type { DocGenConfig } from '../../../src/config';

const config: DocGenConfig = {
  includes: ['__tests__/treeBuilderFakeTestsRenames'],
  testFunctionNameOverride: 'testProxy',
  describeFunctionNameOverride: 'describeProxy',
  outputDirectory: './__tests__/docs',
  templateDirectory: './__tests__/no_template'
};

export default config;