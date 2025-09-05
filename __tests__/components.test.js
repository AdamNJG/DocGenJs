import { describe, test, expect, afterEach, vi } from 'vitest';
import { defineComponents } from './helpers/componentHelper';
import UseCaseComponent from '../src/WebBuilder/Components/pages/useCase';
import ModuleComponent from '../src/WebBuilder/Components/pages/module';
import FeatureComponent from '../src/WebBuilder/Components/pages/feature';
import PageNav from '../src/WebBuilder/Components/pageNav';

describe('Components with invalid inputs', () => {
  defineComponents();

  test('undefined input for useCase generates empty outerHTML', () => {
    const useCase = new UseCaseComponent();

    useCase.setup({useCase: undefined, index: 1});

    expect(useCase.outerHTML).toBe('<use-case-component></use-case-component>');
  });

  test('undefined input for module generates empty outerHTML', () => {
    const module = new ModuleComponent();

    module.setup(undefined);

    expect(module.outerHTML).toBe('<module-component></module-component>');
  });

  test('undefined input for feature generates empty outerHTML', () => {
    const feature = new FeatureComponent();

    feature.setup({feature: undefined, index: 0});

    expect(feature.outerHTML).toBe('<feature-component></feature-component>');
  });
});

  test('undefined input for nav generates empty outerHTML', () => {
    const pageNav = new PageNav();

    pageNav.setup({feature: undefined, index: 0});

   expect(pageNav.outerHTML).toBe('<page-nav></page-nav>');
  });
});