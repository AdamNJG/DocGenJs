import ModuleComponent from '../../src/WebBuilder/Components/pages/module';
import FeatureComponent from '../../src/WebBuilder/Components/pages/feature';
import UseCaseComponent from '../../src/WebBuilder/Components/pages/useCase';
import PageNav from '../../src/WebBuilder/Components/index/pageNav';

function declareComponents (components: Record<string, CustomElementConstructor>) {
  Object.entries(components).forEach(([tagName, constructor]) => {
    if (!customElements.get(tagName)) {
      customElements.define(tagName, constructor);
    }
  });
}

export function defineComponents () {
  declareComponents({
    'module-component': ModuleComponent,
    'feature-component': FeatureComponent,
    'use-case-component': UseCaseComponent,
    'page-nav': PageNav });
}