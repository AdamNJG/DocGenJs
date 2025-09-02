export function setupHtmlElement () {
  if (typeof globalThis.HTMLElement === 'undefined') {
    globalThis.HTMLElement = class {
      innerHTML = '';
      get outerHTML () { return this.innerHTML; }
    } as any;
  }
}