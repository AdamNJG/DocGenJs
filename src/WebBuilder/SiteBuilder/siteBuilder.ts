import Config from '../../Config/config';
import type { DocGenConfig } from '../../Config/types';
import * as fs from 'fs';
import * as path from 'path';
import PageNav from '../Components/pageNav';
import TreeBuilder from '../../TreeBuilder/treeBuilder';
import PageBuilder from '../PageBuilder/pageBuilder';
import FeatureComponent from '../Components/pages/feature';
import ModuleComponent from '../Components/pages/module';
import UseCaseComponent from '../Components/pages/useCase';
import { InstructionTree } from '../../TreeBuilder/types';

type CopyResult =
  | { success: true; }
  | { success: false; message: string};

type TreeResult = 
  | { success: true; tree: InstructionTree}
  | { success: false; };

class SiteBuilder {
  private _config: Config;
  private _pages: string[] = [];
  private _nav: string = '';
  private _tree: TreeResult = { success: false };

  constructor (config: DocGenConfig) {
    const configResult = Config.parse(config);
    if (configResult.validated === false) {
      console.error('\x1b[31m%s\x1b[0m', '❌ Invalid config:'); // red
      console.error('  ' + configResult.message);               // indented message
      console.error('  Please add a test folder to the `includes` array in your config.');
      process.exit(1); // Exit with non-zero code
    }
    this._config = configResult.config;
    this.setupComponents();
  }

  buildSite () {
    this.ensureDocumentationDirectoryIsClean(this._config.outputDirectory);

    this.buildTree();

    this.setNav();
    this.buildPages();
    
    this.copyIndexHtmlAndCss(this._config.outputDirectory);
    console.log(`Generation completed, you can find your files at ${this._config.outputDirectory}`);
  }

  private ensureDocumentationDirectoryIsClean (dirPath: string) {
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
    }
    fs.mkdirSync(dirPath, { recursive: true });
  }

  private copyIndexHtmlAndCss (dirPath: string) {
    const indexDestFilePath = path.join(dirPath, 'index.html');
    const indexResult = this.generateFile(`./${this._config.templateDirectory}/index.html`, indexDestFilePath, (input) => {return input.replace(/{{PAGE_NAV}}/g, this._nav);});

    if (indexResult.success === false) {
      console.error(indexResult.message);
    } else {
      console.log(`File generated in: ${indexDestFilePath}`);
    }

    const cssDestFilePath = path.join(dirPath, 'styles.css');
    const cssResult = this.generateFile(`./${this._config.templateDirectory}/styles.css`, cssDestFilePath);

    if (cssResult.success === false) {
      console.error(cssResult.message);
    } else {
      console.log(`File generated in: ${cssDestFilePath}`);
    }
  }

  private generateFile (sourceFileName: string, destFilePath: string, transformFunction?: (string: string) => string) : CopyResult {
    const sourceFilePath = path.resolve(sourceFileName);

    if (!fs.existsSync(sourceFilePath)) {
      return { success: false, message: `Source file does not exist: ${sourceFilePath}, aborting copy for this file` };
    }

    try {
      const fileContent = fs.readFileSync(sourceFilePath, 'utf-8');

      const transformedFileContent = transformFunction ? transformFunction(fileContent) : fileContent;

      fs.writeFileSync(destFilePath, transformedFileContent, 'utf-8');

      return { success: true };
    } catch (err) { 
      return { success: false, message: `Copy for file ${sourceFilePath} failed: ${err}` };
    } 
  }

  private setNav () {
    if (this._tree.success == false) {
      this._nav = '';
      return;
    }

    const nav =  new PageNav();
    nav.setup(this._tree.tree.pages.map(p => p.name));
    this._nav = nav.outerHTML;
  }

  private buildTree () {
    const tree = TreeBuilder.build(this._config);
    this._tree= { success: true, tree: tree };
  }

  private buildPages () {
    if (this._tree.success == false) {
      this._pages = [];
      return;
    }
    const pages = PageBuilder.buildPages(this._tree.tree, this._nav, this._config.templateDirectory);
    console.log(`Found ${Object.keys(pages).length} test files`);
    Object.entries(pages).forEach(([key, value]) => {
      this.createHtmlFromPage(key, value);
    });

    this._pages = Object.keys(pages);
  }

  private createHtmlFromPage (pageName: string, page: string) {
    try {
      const outputDir = path.join(this._config.outputDirectory, `${pageName}.html`);
      fs.writeFileSync(outputDir, page,'utf-8');
      console.log(`File generated in: ${outputDir}`);
    } catch (err) {
      console.error(`Error saving html file: ${pageName}.html, Error: ${err}`);
    }
  }

  private async setupComponents () {

    this.declareComponents({ 'page-nav': PageNav, 'feature-component': FeatureComponent, 'module-component' : ModuleComponent, 'use-case-component': UseCaseComponent });
  }
  
  private declareComponents (components: Record<string, CustomElementConstructor>) {
    Object.entries(components).forEach(([tagName, constructor]) => {
      if (!customElements.get(tagName)) {
        customElements.define(tagName, constructor);
      }
    });
  }
}

export default SiteBuilder;