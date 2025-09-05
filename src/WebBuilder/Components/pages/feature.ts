import { Feature } from '../../../TreeBuilder/types';
import UseCaseComponent from './useCase';

class FeatureComponent extends HTMLElement {
  private _feature: Feature;
  private _index: number;

  setup ({ feature, index }: {feature: Feature, index: number}) {
    this._feature = feature;
    this._index = index;
    this.render();
  }

  private render () {
    if (!this._feature) {
      this.innerHTML = '';
      return;
    }

    this.innerHTML = `<article class="feature-component" role="region" aria-labelledby="feature-${this._index}-title">
      <h2 id="feature-${this._index}-title">${this._feature.name}</h2>
      <ul class="use-cases" aria-label="Use Cases">
      </ul>
    </article>`;

    const useCaseContainer = this.querySelector('.use-cases');

    if (this._feature.useCases.length === 0) {
      useCaseContainer.innerHTML = '<li class="no-use-cases">No use cases yet</li>';
    } else {
      this._feature.useCases.forEach((useCase, index) => {
        const incrementedIndex = index + 1;
        const useCaseEl = new UseCaseComponent();
        useCaseEl.setup({ useCase, index: incrementedIndex });
        useCaseContainer.appendChild(useCaseEl);
      });
    }
  }
}

export default FeatureComponent;