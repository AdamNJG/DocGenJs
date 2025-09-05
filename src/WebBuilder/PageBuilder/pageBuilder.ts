import { InstructionTree, Page } from '../../TreeBuilder/types';
import * as fs from 'fs';
import * as path from 'path';
import ModuleComponent from '../Components/pages/module';

class PageBuilder {

  static buildPages (tree: InstructionTree, nav: string): Record<string, string> {
    const renderedHtml: Record<string, string> = {};
    const templatePath = path.resolve('./templates/page.html');
    const template = fs.readFileSync(templatePath, 'utf-8');

    for (const page of tree.pages) {
      const compiledPage = PageBuilder.buildPage(page);

      const pageHtml = template
        .replace(/{{PAGE_TITLE}}/g, page.name)
        .replace(/{{COMPONENTS}}/g, compiledPage)
        .replace(/{{PAGE_NAV}}/g, nav);

      renderedHtml[page.name] = pageHtml;
    }

    return renderedHtml;
  }

  static buildPage (page: Page): string {
    const pageComponent = new ModuleComponent();
    pageComponent.setup(page);
    return pageComponent.outerHTML;
  }
}

export default PageBuilder;