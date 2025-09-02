import Config from '../../src/Config/config';
import { TestConfig } from '../../src/Config/types';

export function BuildConfig ({
  includes = ['__tests__'], 
  testFunctionNameOverride: testFunctionName, 
  describeFunctionNameOverride: describeFunctionName,
  testSuffixToRemove,
  outputDirectory,
  templateDirectory
} : TestConfig): Config {
  const result = Config.parse({ 
    includes, 
    testFunctionNameOverride: testFunctionName, 
    describeFunctionNameOverride: describeFunctionName,
    testSuffixToRemove,
    outputDirectory,
    templateDirectory
  });

  switch (result.validated) {
  case true: 
    return result.config;
  case false:
    throw Error(result.message);
  }
}