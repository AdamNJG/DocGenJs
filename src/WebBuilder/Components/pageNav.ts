
class PageNav extends HTMLElement {
  private _pages: string[] | undefined;

  setup (pages: string[]) {
    this._pages = pages;
    this.render();
  }

  private render () {
    if (!this._pages || this._pages.length === 0) {
      this.innerHTML = '';
      return;
    }

    this.innerHTML = `<nav class="pages-nav" aria-label="Pages navigation">
      <ul class="page-links"></ul>
    </nav>`;

    const linkContainer = this.querySelector('.page-links');

    if (!linkContainer) return;

    this._pages.unshift('index');

    this._pages.forEach((page: string) => {
      const li = document.createElement('li');
      
      const link = document.createElement('a');
      link.href = `./${page}.html`;
      link.textContent = page;
      
      li.appendChild(link);
      linkContainer.appendChild(li);
    });
  }
}

export default PageNav;