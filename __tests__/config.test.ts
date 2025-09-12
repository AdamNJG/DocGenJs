import { describe, test, expect } from 'vitest';
import Config from '../src/Config/config';
import * as path from 'path';
import { DocGenConfig } from '../src/Config/types';
import { deleteEmptyFolder, createEmptyFolder } from './helpers/folderHelper';

describe('config parsing and setup', () => {

  test('importConfig_ConfigPresent_ConfigMatches', () => {
    const configObject: DocGenConfig = {
      includes: ['./__tests__'],
      describeFunctionNameOverride: 'describeProxy',
      testFunctionNameOverride: 'testProxy',
      testSuffixToRemove: 'spec',
      outputDirectory: './output'
    };

    const result = Config.parse(configObject);

    expectValidConfig(result, configObject);
  });

  test('importConfig_ConfigPresentAndInnerEmptyFolder_ConfigMatches', async () => {
    const emptyFolderPath = './__tests__/emptyFolder';
    const resolvedPath = path.resolve(emptyFolderPath);
    await createEmptyFolder(resolvedPath);

    const configObject: DocGenConfig = {
      includes: ['./__tests__'],
      describeFunctionNameOverride: 'describe',
      testFunctionNameOverride: 'test',
      testSuffixToRemove: 'spec',
      outputDirectory: './output'
    };

    const result = Config.parse(configObject);

    expectValidConfig(result, configObject);
  });

  test('importConfig_defaultDocsOutputDirectory_ConfigMatches', () => {
    const configObject: DocGenConfig = {
      includes: ['./__tests__'],
      describeFunctionNameOverride: 'describe',
      testFunctionNameOverride: 'test'
    };

    const result = Config.parse(configObject);

    expectValidConfig(result, { ...configObject, outputDirectory: './docs' });
  });

  test('importConfig_ConfigPresentWithNoDescribeOrTestOverrides_ConfigMatches', () => {
    const configObject: DocGenConfig = {
      includes: ['./__tests__']
    };

    const result = Config.parse(configObject);

    expectValidConfig(result, { ...configObject, describeFunctionNameOverride: 'describe', testFunctionNameOverride: 'test' });
  });

  test('importConfig_WrongFolderSelected_TestErrorReturned', () => {
    const configObject: DocGenConfig = {
      includes: ['./__not_tests__'],
      describeFunctionNameOverride: 'describe',
      testFunctionNameOverride: 'test'     
    };

    const result = Config.parse(configObject);

    expectInvalidConfig(result, `Test folder specified not found, looking for ${configObject.includes}`);
  });

  test('importConfig_IncludesEmpty_TestErrorReturned', () => {
    const configObject: DocGenConfig = {
      includes: []  
    };

    const result = Config.parse(configObject);

    expectInvalidConfig(result, `Test folder not specified, please add one to the includes array of the config`);
  });

  test('importConfig_WrongFolderSelected_TemplateErrorReturned', () => {
    const configObject: DocGenConfig = {
      includes: ['./__tests__'],
      describeFunctionNameOverride: 'describe',
      testFunctionNameOverride: 'test',
      templateDirectory: './__tests__/templates'
    };

    const result = Config.parse(configObject);

    expectInvalidConfig(result, `Template folder specified not found, looking for ${configObject.templateDirectory}`);
  });

  test('importConfig_CorrectFolderSelectedButEmpty_TestErrorReturned', async () => {
    const emptyFolderPath = './__tests__/emptyFolder';
    const resolvedPath = path.resolve(emptyFolderPath);

    await createEmptyFolder(resolvedPath);

    const configObject: DocGenConfig = {
      includes: [emptyFolderPath],
      describeFunctionNameOverride: 'describe',
      testFunctionNameOverride: 'test'     
    };

    const result = Config.parse(configObject);

    expectInvalidConfig(result, `Folder: ${configObject.includes} was found, but is empty`);

    await deleteEmptyFolder(resolvedPath);
  });

  test('importConfig_DescribeAndTestNotFound_TestErrorReturned', () => {
    const configObject: DocGenConfig = {
      includes: ['./__tests__'],
      describeFunctionNameOverride: 'not' + 'describe',
      testFunctionNameOverride: 'not' + 'test'     
    };

    const result = Config.parse(configObject);

    expectInvalidConfig(result, `No describe or test functions found in ${configObject.includes} (looking for describe: ${configObject.describeFunctionNameOverride} or test: ${configObject.testFunctionNameOverride})`);
  });
}); 

describe('get files', () => {
  test('successfullConfig_getFiles_hasFiles', () => {
    const configObject: DocGenConfig = {
      includes: ['./__tests__']
    };

    const result = Config.parse(configObject);

    if (result.validated === true) {
      const relativeFiles = result.config.files.map(file =>
        path.relative(process.cwd(), file).replace(/\\/g, '/'));

      expect(relativeFiles).toStrictEqual([
        '__tests__/cli.test.ts',
        '__tests__/components.test.js',
        '__tests__/config.test.ts',
        '__tests__/configs/docgen.config.js',
        '__tests__/configs/docgen.config.ts',
        '__tests__/configs/template/docgen.config.ts',
        '__tests__/helpers/componentHelper.ts',
        '__tests__/helpers/configHelper.ts',
        '__tests__/helpers/elementHelper.ts',
        '__tests__/helpers/folderHelper.ts',
        '__tests__/helpers/stringHelper.ts',
        '__tests__/pageBuilder.test.ts',
        '__tests__/runSiteBuilder.test.ts',
        '__tests__/treeBuilder.test.ts',
        '__tests__/treeBuilderFakeTests/fake.test.ts',
        '__tests__/treeBuilderFakeTests/more.fake.test.ts',
        '__tests__/treeBuilderFakeTests/no.describe.fake.test.ts',
        '__tests__/treeBuilderFakeTestsRenames/fake.test.ts'
      ]);
    }
  });

  test('successfullConfig_getFilesExcludes_hasFiles', () => {
    const configObject: DocGenConfig = {
      includes: ['./__tests__'],
      excludes: [
        './__tests__/helpers/**', 
        './__tests__/treeBuilderFakeTests/**',
        './__tests__/treeBuilderFakeTestsRenames/**',
        './__tests__/fakeComponents/**'
      ]
    };

    const result = Config.parse(configObject);

    if (result.validated === true) {
      const relativeFiles = result.config.files.map(file =>
        path.relative(process.cwd(), file).replace(/\\/g, '/'));

      expect(relativeFiles).toStrictEqual([
        '__tests__/cli.test.ts',
        '__tests__/components.test.js',
        '__tests__/config.test.ts',
        '__tests__/configs/docgen.config.js',
        '__tests__/configs/docgen.config.ts',
        '__tests__/configs/template/docgen.config.ts',
        '__tests__/pageBuilder.test.ts',
        '__tests__/runSiteBuilder.test.ts',
        '__tests__/treeBuilder.test.ts'
      ]);
    }
  });

  test('successfulConfig_testFileExtensions_getsCorrectFiles', () => {
    const configObject: DocGenConfig = {
      includes: ['./__tests__'],
      excludes: [
        './__tests__/helpers/**', 
        './__tests__/treeBuilderFakeTests/**',
        './__tests__/treeBuilderFakeTestsRenames/**'
      ],
      additionalFileExtensions: ['tsx', 'jsx']
    };

    const result = Config.parse(configObject);

    if (result.validated === true) {
      const relativeFiles = result.config.files.map(file =>
        path.relative(process.cwd(), file).replace(/\\/g, '/'));

      expect(relativeFiles).toStrictEqual([
        '__tests__/cli.test.ts',
        '__tests__/components.test.js',
        '__tests__/config.test.ts',
        '__tests__/configs/docgen.config.js',
        '__tests__/configs/docgen.config.ts',
        '__tests__/configs/template/docgen.config.ts',
        '__tests__/fakeComponents/fakeJsComponent.test.jsx',
        '__tests__/fakeComponents/fakeTsComponent.test.tsx',
        '__tests__/pageBuilder.test.ts',
        '__tests__/runSiteBuilder.test.ts',
        '__tests__/treeBuilder.test.ts'
      ]);
    }
  });

  test('collects files recursively and applies excludes correctly', () => {
    const configObject: DocGenConfig = {
      includes: ['./__tests__'],
      excludes: [
        './__tests__/helpers/**', 
        './__tests__/treeBuilderFakeTests/**',
        './__tests__/treeBuilderFakeTestsRenames/**',
        '__tests__/fakeComponents/**'
      ],
      additionalFileExtensions: ['tsx', 'jsx']
    };

    const result = Config.parse(configObject);

    if (result.validated === true) {
      const relativeFiles = result.config.files.map(file =>
        path.relative(process.cwd(), file).replace(/\\/g, '/'));

      expect(relativeFiles).toStrictEqual([
        '__tests__/cli.test.ts',
        '__tests__/components.test.js',
        '__tests__/config.test.ts',
        '__tests__/configs/docgen.config.js',
        '__tests__/configs/docgen.config.ts',
        '__tests__/configs/template/docgen.config.ts',
        '__tests__/pageBuilder.test.ts',
        '__tests__/runSiteBuilder.test.ts',
        '__tests__/treeBuilder.test.ts'
      ]);
    }
  });

  test('additionalFileExtensions_areMergedWithDefaults', () => {
    const configObject: DocGenConfig = {
      includes: ['./__tests__/fakeComponents'],
      additionalFileExtensions: ['ts', 'js', 'jsx']
    };

    const result = Config.parse(configObject);
    expect(result.validated).toBe(true);

    if (result.validated === true) {
      const files = result.config.files.map(f => path.relative(process.cwd(), f).replace(/\\/g, '/'));
      expect(files).toContain('__tests__/fakeComponents/fakeJsComponent.test.jsx');
    }
  });

  test('excludes_pattern_skipsFilesCorrectly', () => {
    const configObject: DocGenConfig = {
      includes: ['./__tests__'],
      excludes: ['./__tests__/components.test.js']
    };

    const result = Config.parse(configObject);
    if (result.validated === false) console.log(result.message);

    expect(result.validated).toBe(true);
    if (result.validated === true) {
      const files = result.config.files.map(f => path.relative(process.cwd(), f).replace(/\\/g, '/'));
      expect(files).not.toContain('__tests__/components.test.js');
    }
  });
});

function expectValidConfig (result, expected: DocGenConfig) {
  if (result.validated === false) {
    throw new Error(result.message);
  }

  expect(result.config.includes).toBe(expected.includes);
  expect(result.config.describeFunctionName).toBe(expected.describeFunctionNameOverride);
  expect(result.config.testFunctionName).toBe(expected.testFunctionNameOverride);
  expect(result.config.testSuffixToRemove).toBe(expected.testSuffixToRemove);
}

function expectInvalidConfig (result, message: string) {
  if (result.validated) {
    throw new Error('the config passed validation, when it should not have');
  }
  expect(result.message).toBe(message);
}

