type Node = string | ServerSideComponent;

export class ServerSideComponent {
  children: Node[] = [];
  innerHTMLContent: string = "";

  constructor() {}

  // Drop-in replacement for HTMLElement.appendChild
  appendChild(child: Node) {
    this.children.push(child);
  }

  // Drop-in replacement for HTMLElement.innerHTML setter
  set innerHTML(html: string) {
    this.children = [];
    this.innerHTMLContent = html;
  }

  get innerHTML(): string {
    return this.innerHTMLContent;
  }

  // Returns the full HTML string for this component and its children
  get outerHTML(): string {
    if (this.innerHTMLContent) {
      return this.innerHTMLContent;
    }
    return this.children
      .map(child => (typeof child === "string" ? child : child.outerHTML))
      .join("");
  }

  // Lifecycle hook you can override
  connectedCallback() {}

  // Optional setup method (like your existing components)
  setup(props: Record<string, any>) {}
}
