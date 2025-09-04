import { describe, test, expect, afterEach, vi, vitest, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import SiteBuilder from '../src/WebBuilder/SiteBuilder/siteBuilder';
import runSiteBuilder from '../src/Cli/runSiteBuilder';
import { defineComponents } from './helpers/componentHelper';
import { DocGenConfig } from '../src/Config/types';
import { deleteEmptyFolder, createEmptyFolder } from './helpers/folderHelper';
import { testElement } from './helpers/elementHelper';
import { checkGeneratedPages, checkMain, checkPage, expectGeneratedFiles, removeOutputDirectory } from './helpers/folderHelper';

const CONFIG_FILE = path.resolve('./docgen.config');
const CONFIG_FILE_TS = CONFIG_FILE + '.ts';
const CONFIG_FILE_JS = CONFIG_FILE + '.js';
const TEST_CONFIG_FILE = path.resolve('./__tests__/configs/docgen.config');

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
    await restoreDocGenConfig();
  });

  beforeEach(() => {
    vitest.resetModules();
  });

  test('json config will trigger site generation to default location, overriding existing files', async () => {
    const outputDirectory = './__tests__/docs/runSiteBuilderTests';

    await replaceDocGenConfig('.ts');

    fs.mkdirSync(outputDirectory, { recursive: true });
    const dummyPagePath = path.join(outputDirectory, 'oldPage.html');
    fs.writeFileSync(dummyPagePath, 'old content', 'utf-8');

    await runSiteBuilder();

    expect(fs.existsSync(dummyPagePath)).toBe(false);
    expect(fs.existsSync(outputDirectory)).toBe(true);
    expectGeneratedFiles(outputDirectory, expectedFiles);
  });

  test('passing in json config will trigger site generation to specified location', async () => {
    const outputDirectory = './__tests__/docs';

    await replaceDocGenConfig('.js');
    const config = {
      includes: ['__tests__/treeBuilderFakeTests'],
      outputDirectory: './__tests__/docs'
    };

    await runSiteBuilder();

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
    await replaceDocGenConfig('.ts', './__tests__/configs/template/docgen.config.ts');

    const consoleSpy: ReturnType<typeof vi.spyOn> = vi.spyOn(console, 'error').mockImplementation(() => {});
    const outputDirectory = './__tests__/docs';
    const templateDirectory = './__tests__/no_template';
    const resolvedTemplatePath = path.join(process.cwd(), '__tests__', 'no_template');
    await createEmptyFolder(resolvedTemplatePath);

    await runSiteBuilder();

    expect(fs.existsSync(outputDirectory)).toBe(true);
    expectGeneratedFiles(outputDirectory, expectedFiles, false);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining(`Source file does not exist: ${path.resolve(templateDirectory, 'index.html')}, aborting copy for this file`));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining(`Source file does not exist: ${path.resolve(templateDirectory, 'styles.css')}, aborting copy for this file`));

    consoleSpy.mockRestore();
    deleteEmptyFolder(resolvedTemplatePath);
  });

  test('uses default config when none exists', async () => {  
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    try {
      const outputDirectory = './docs';
      await renameDocGenConfig();

      await runSiteBuilder();

      expect(consoleSpy.mock.calls[0][0]).toContain('Using default configuration. You can create a docgen.config.ts/js file to customise future runs.');
      
      expect(fs.existsSync(outputDirectory)).toBe(true);
      expectGeneratedFiles(outputDirectory, expectedFiles);
    
      checkGeneratedPages(expectedContents, { includes: [], outputDirectory: outputDirectory });
    } finally {
      consoleSpy.mockRestore();
    }
  });

  test('passing in invalid config error displayed', () => {
    const config: DocGenConfig = {
      includes: ['']
    };

    expect(() => new SiteBuilder(config)).toThrow('invalid config: Test folder specified not found, looking for ');
  });
});

async function replaceDocGenConfig (extension: string, filePath?: string) {
  if (fs.existsSync(CONFIG_FILE_TS)) {
    await fs.promises.rename(CONFIG_FILE_TS, CONFIG_FILE_TS + '.backup');
  }

  if (filePath) {
    const resolvedFilePath = path.resolve(filePath);
    await fs.promises.copyFile(resolvedFilePath, CONFIG_FILE_TS);
  } else {
    await fs.promises.copyFile(TEST_CONFIG_FILE + extension, CONFIG_FILE + extension);
  }
}

async function renameDocGenConfig () {
  if (fs.existsSync(CONFIG_FILE_JS)) await fs.promises.rm(CONFIG_FILE_JS);

  if (fs.existsSync(CONFIG_FILE_TS)) await fs.promises.rename(CONFIG_FILE_TS, CONFIG_FILE_TS + '.backup');
}

async function restoreDocGenConfig () {
  const backupExists = fs.existsSync(CONFIG_FILE_TS + '.backup');

  if (backupExists) {
    if (fs.existsSync(CONFIG_FILE_TS)) await fs.promises.rm(CONFIG_FILE_TS);
    await fs.promises.rename(CONFIG_FILE_TS + '.backup', CONFIG_FILE_TS);
  } else {
    if (fs.existsSync(CONFIG_FILE_JS)) await fs.promises.rm(CONFIG_FILE_JS);
  }
}