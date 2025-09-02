import ModuleComponent from '../../src/WebBuilder/Components/pages/module';
import FeatureComponent from '../../src/WebBuilder/Components/pages/feature';
import UseCaseComponent from '../../src/WebBuilder/Components/pages/useCase';
import PageNav from '../../src/WebBuilder/Components/index/pageNav';

function defineOnce (tagName: string, elementClass: CustomElementConstructor) {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, elementClass);
  }
}

export function defineComponents () {
  defineOnce('module-component', ModuleComponent);
  defineOnce('feature-component', FeatureComponent);
  defineOnce('use-case-component', UseCaseComponent);
  defineOnce('page-nav', PageNav);
}