import { UseCase } from '../../../TreeBuilder/types';

class UseCaseComponent extends HTMLElement {
  private _useCase: UseCase | undefined;
  private _index: number | undefined;

  setup ({ useCase, index }: {useCase: UseCase, index: number}) {
    this._useCase = useCase;
    this._index = index;
    this.render();
  }

  private render () {
    if (!this._useCase) {
      this.innerHTML = '';
      return;
    }

    this.innerHTML = `<li class="use-case" aria-labeledby="usecase-${this._index}-title">
      <h3 id="usecase-${this._index}-title">${this._useCase.name}</h3>
      <pre><code class="language-ts">${this._useCase.codeExample}</code></pre>
    </li>`;
  }
}

export default UseCaseComponent;