import { Page } from '../../../TreeBuilder/types';
import FeatureComponent from './feature';

class ModuleComponent extends HTMLElement {
  private _page: Page | undefined;

  setup (value: Page) {
    this._page = value;
    this.render();
  }

  private render () {
    if (!this._page) {
      this.innerHTML = '';
      return;
    }

    this.innerHTML = `
      <article class="module-component" role="region" aria-labelledby="module-title">
        <h1 id="module-title">${this._page.name}</h1>
        <section class="features" aria-label="Features">
          <ul>
          </ul>
        </section>
      </article>`;

    const featureContainer = this.querySelector('.features')?.querySelector('ul');

    if (!featureContainer) return;

    if (this._page.features.length === 0) {
      featureContainer.innerHTML = `<li class="no-features">No features yet</li>`;
    } else {
      this._page.features.forEach((feature, index) => {
        const incrementedIndex = index + 1;
        const li = document.createElement('li');
        li.setAttribute('id', `feature-${incrementedIndex}`);
        li.setAttribute('class', 'feature-container');

        const featureEl = new FeatureComponent();
        featureEl.setup({ feature, index: incrementedIndex });

        li.appendChild(featureEl);
        featureContainer.appendChild(li);
      });
    }
  }
}

export default ModuleComponent;