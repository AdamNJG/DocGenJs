import { describe, test, expect, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import SiteBuilder from '../src/WebBuilder/SiteBuilder/siteBuilder';
import { defineComponents } from './helpers/componentHelper';
import { TestConfig } from '../src/Config/types';
import { deleteEmptyFolder, createEmptyFolder } from './helpers/folderHelper';
import { testElement } from './helpers/elementHelper';

describe('SiteBuilder', () => {
  defineComponents();

  const expectedFiles = ['index.html', 'styles.css'];
  const expectedContents: Record<string, (doc: Document) => void> = {
    'index.html': checkMain,
    'fake.test.html': checkPage,
    'more.fake.test.html': checkPage,
    'no.describe.fake.test.html': checkPage
  };

  afterEach(async () => {
    await removeOutputDirectory('./__tests__/docs/');
    await removeOutputDirectory('./docs');
  });

  test('json config will trigger site generation to default location, overriding existing files', () => {
    const outputDirectory = './docs';
    const config: TestConfig = {
      includes: [path.join('__tests__', 'treeBuilderFakeTestsRenames')],
      describeFunctionNameOverride: 'describeProxy',
      testFunctionNameOverride: 'testProxy'
    };
    fs.mkdirSync(outputDirectory, { recursive: true });
    const dummyPagePath = path.join(outputDirectory, 'oldPage.html');
    fs.writeFileSync(dummyPagePath, 'old content', 'utf-8');

    const builder = new SiteBuilder(config);
    builder.buildSite();

    expect(fs.existsSync(dummyPagePath)).toBe(false);
    expect(fs.existsSync(outputDirectory)).toBe(true);
    expectGeneratedFiles(outputDirectory, expectedFiles);
  });

  test('passing in json config will trigger site generation to specified location', () => {
    const outputDirectory = './__tests__/docs';

    const config: TestConfig = {
      includes: ['__tests__/treeBuilderFakeTests'],
      outputDirectory: outputDirectory
    };

    const builder = new SiteBuilder(config);
    builder.buildSite();

    expect(fs.existsSync(outputDirectory)).toBe(true);
    expectGeneratedFiles(outputDirectory, expectedFiles);
    
    checkGeneratedPages(expectedContents, config);
    checkGeneratedPages({ 'index.html': (document: Document) => {
      const nav = document.querySelector('.pages-nav');
      testElement(nav, 'nav', { 'aria-label': 'Pages navigation' });

      const ul = nav?.querySelector('ul');
      expect(ul).not.toBe(null);

      const pages = ['fake.test',
        'more.fake.test',
        'no.describe.fake.test'];

      pages.forEach(page => {
        const link = Array.from(ul?.querySelectorAll('li > a') || [])
          .find(a => a.getAttribute('href') === `./${page}.html`);

        expect(link).not.toBe(null);
        expect(link?.textContent?.trim()).toBe(page);
        const tabIndex = link?.getAttribute('tabindex');
        expect(tabIndex === null || Number(tabIndex) >= 0).toBe(true);
      });
    } }
    , config);
  });

  test('passing in json config with overriden templateDirectory that exists but is empty', async () => {
    const consoleSpy: ReturnType<typeof vi.spyOn> = vi.spyOn(console, 'error').mockImplementation(() => {});
    const outputDirectory = './__tests__/docs';
    const templateDirectory = './__tests__/no_template';
    const resolvedTemplatePath = path.join(process.cwd(), '__tests__', 'no_template');
    await createEmptyFolder(resolvedTemplatePath);

    const config: TestConfig = {
      includes: ['__tests__/treeBuilderFakeTestsRenames'],
      testFunctionNameOverride: 'testProxy',
      describeFunctionNameOverride: 'describeProxy',
      outputDirectory: outputDirectory,
      templateDirectory: templateDirectory
    };

    const builder = new SiteBuilder(config);
    builder.buildSite();

    expect(fs.existsSync(outputDirectory)).toBe(true);
    expectGeneratedFiles(outputDirectory, expectedFiles, false);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining(`Source file does not exist: ${path.resolve(templateDirectory, 'index.html')}, aborting copy for this file`));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining(`Source file does not exist: ${path.resolve(templateDirectory, 'styles.css')}, aborting copy for this file`));

    consoleSpy.mockRestore();
    deleteEmptyFolder(resolvedTemplatePath);
  });

  test('passing in invalid config error displayed', () => {
    const config: TestConfig = {
      includes: ['']
    };

    expect(() => new SiteBuilder(config)).toThrow('invalid config: Test folder specified not found, looking for ');
  });
});

function removeOutputDirectory (directory: string) {
  const resolvedPath = path.resolve(directory);
  return fs.promises.rm(resolvedPath, { recursive: true, force: true });
}

function expectGeneratedFiles (dir: string, files: string[], shouldBeTrue: boolean = true) {
  for (const file of files) {
    expect(fs.existsSync(path.join(dir, file))).toBe(shouldBeTrue);
  }
}

function checkGeneratedPages (expectedContents: Record<string, (doc: Document) => void>, config: TestConfig) {
  Object.entries(expectedContents).forEach(([key, expectFunction]) => {
    const doc = getOutputtedDocument(key, config.outputDirectory ?? '');
    expectFunction(doc);
  });
}

function getOutputtedDocument (page: string, outputDirectory: string): Document { 
  const joinedPath = path.join(outputDirectory, page);
  const resolvedPath = path.resolve(joinedPath);

  const html = fs.readFileSync(resolvedPath, 'utf-8');
  const parser = new DOMParser();
  return parser.parseFromString(html, 'text/html');
}

function checkMain (document: Document) {
  const nav = document.querySelector('.pages-nav');
  expect(nav).not.toBe(null);
}

function checkPage (document: Document) { 
  const module = document.querySelector('.module-component');
  expect(module).not.toBe(null);
}