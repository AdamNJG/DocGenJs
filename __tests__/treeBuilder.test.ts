import { describe, test, expect } from 'vitest';
import { BuildConfig } from './helpers/configHelper';
import TreeBuilder from '../src/TreeBuilder/treeBuilder';
import { normalizeIndent } from './helpers/stringHelper';
import { Feature, Page, UseCase } from '../src/TreeBuilder/types';

describe('tree builder', () => {
  const codeExample = `const a = 1;\nconst b = 2;\nexpect(a + b).toBe(3);`;
  test('creates tree with renamed functions and keeps ".test" suffix', () => {
    const config = BuildConfig({
      includes: ['__tests__\\treeBuilderFakeTestsRenames'],
      testFunctionNameOverride: 'testProxy',
      describeFunctionNameOverride: 'describeProxy'
    });

    const tree = TreeBuilder.build(config);

    const page = tree.pages[0];
    checkPage(page, 'fake.test', 1);

    const feature = page.features[0];
    checkFeature(feature, 'this is a fake description', 1);

    const useCase = feature.useCases[0];
    checkUseCase(useCase, 'this is a fake test', codeExample);

  });

  test('creates tree with renamed functions and removes "test" suffix', () => {
    const config = BuildConfig({
      includes: ['__tests__\\treeBuilderFakeTestsRenames'],
      testFunctionNameOverride: 'testProxy',
      describeFunctionNameOverride: 'describeProxy',
      testSuffixToRemove: 'test'
    });

    const tree = TreeBuilder.build(config);

    const page = tree.pages[0];
    checkPage(page, 'fake', 1);

  });

  test('creates tree with default config and keeps ".test" suffix', () => {
    const config = BuildConfig({
      includes: ['__tests__\\treeBuilderFakeTests'],
      testFunctionNameOverride: 'test', 
      describeFunctionNameOverride: 'describe'
    });

    const tree = TreeBuilder.build(config);

    expect(tree.pages.length).toBe(3);

    const page1 = tree.pages[0];
    expect(page1.features.length).toBe(1);
    checkPage(page1, 'fake.test', 1);

    const featureForPage1 = page1.features[0];
    checkFeature(featureForPage1, 'this is a fake description', 1);

    const useCaseFeaturePage1 = featureForPage1.useCases[0];
    checkUseCase(useCaseFeaturePage1, 'this is a fake test',  codeExample);

    const page2 = tree.pages[1];
    checkPage(page2, 'more.fake.test', 2);

    expect(page2.features.some(f => f.name === 'this should not be a test')).toBeFalsy();
 
    const feature1Page2 = page2.features[0];
    checkFeature(feature1Page2, 'this is a fake description', 1);

    const useCaseFeature1Page2 = feature1Page2.useCases[0];
    checkUseCase(useCaseFeature1Page2, 'this is a fake test', codeExample);

    const feature2Page2 = page2.features[1];
    checkFeature(feature2Page2, 'this is another fake description', 2);

    const useCase1Feature2Page2 = feature2Page2.useCases[0];
    checkUseCase(useCase1Feature2Page2, 'this is a fake test in another fake description', codeExample);

    const useCase2Feature2Page2 = feature2Page2.useCases[1];
    checkUseCase(useCase2Feature2Page2, 'this is another fake test in another fake description', codeExample);
  });

  test('creates tree with default config and top level test statements', () => {
    const config = BuildConfig({
      includes: ['__tests__\\treeBuilderFakeTests'],
      testFunctionNameOverride: 'test', 
      describeFunctionNameOverride: 'describe'
    });

    const tree = TreeBuilder.build(config);

    expect(tree.pages.length).toBe(3);

    const page3 = tree.pages[2];
    checkPage(page3, 'no.describe.fake.test', 3);

    const feature1Page3 = page3.features[0];
    checkFeature(feature1Page3, 'non orphaned fake tests', 1);

    const useCase1Feature1Page3 = feature1Page3.useCases[0];
    checkUseCase(useCase1Feature1Page3, 'this is a non orphaned fake test', codeExample);

    const feature2Page3 = page3.features[1];
    checkFeature(feature2Page3, 'no.describe.fake.test', 2);

    const useCase1Feature2Page3 = feature2Page3.useCases[0];
    checkUseCase(useCase1Feature2Page3, 'this is a fake test', codeExample);

    const useCase2Feature2Page3 = feature2Page3.useCases[1];
    checkUseCase(useCase2Feature2Page3, 'this is another fake test', codeExample);

    const feature3Page3 = page3.features[2];
    checkFeature(feature3Page3, 'more non orphaned fake tests', 1);

    const useCase1Feature3Page3 = feature3Page3.useCases[0];
    checkUseCase(useCase1Feature3Page3, 'this is another non orphaned fake test', codeExample);
  });
});

function checkPage (page: Page, pageName: string, numberOfFeatures: number) {
  expect(page).not.toBeUndefined();
  
  expect(page.features).toHaveLength(numberOfFeatures);
  expect(page.name).toBe(pageName);
}

function checkFeature (feature: Feature, featureName: string, numberOfUseCases: number) {
  expect(feature).not.toBeUndefined();

  expect(feature.useCases).toHaveLength(numberOfUseCases);
  expect(feature.name).toBe(featureName);
}

function checkUseCase (useCase: UseCase, useCaseName: string, codeExample: string) {
  expect(useCase).not.toBeUndefined();
  
  expect(useCase.name).toBe(useCaseName);
  expect(normalizeIndent(useCase.codeExample)).toBe(normalizeIndent(codeExample));
}