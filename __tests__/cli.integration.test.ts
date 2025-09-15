
import { test, describe, expect } from 'vitest';
import { spawn } from 'node:child_process';
import * as path from 'path';
import * as fs from 'fs';
import { resolve } from 'node:path';

const cliPath = './dist/cli.mjs';
const expectedDefaultPages = [
  'base.config',
  'cli.integration.test',
  'componentHelper',
  'components.test',
  'config.test',
  'configHelper',
  'docgen.config',
  'elementHelper',
  'fake.test',
  'folderHelper',
  'more.fake.test',
  'no.describe.fake.test',
  'pageBuilder.test',
  'rename.config',
  'runSiteBuilder.test',
  'stringHelper',
  'treeBuilder.test'
];

describe('cli flow tests', () => {
  test('CLI run with correct config and templates', async () => {
    await copyDocGenConfig('./__tests__/configs/base.config.ts', '.ts');

    const cli = spawn('node', [cliPath], { stdio: ['pipe', 'pipe', 'pipe'] });

    const output = { text: '' };
    const errors: string[] = [];

    cli.stderr.on('data', (chunk) => {
      const errorText = chunk.toString();
      errors.push(errorText);
      console.error('CLI error:', errorText);
    });

    try {
      await waitForOutput(cli, 'DocGen starting', output);
      await waitForOutput(cli, 'Config found and parsed successfully', output);
      await waitForOutput(cli, 'Found 6 test files', output);
      for (const page of ['cli.integration.test', 'components.test', 'config.test', 'pageBuilder.test', 'runSiteBuilder.test', 'treeBuilder.test']) { 
        const filePath = path.join('docs', `${page}.html`);
        await waitForOutput(cli, `File generated in: ${filePath}`, output);
      }
      await waitForOutput(cli, `File generated in: ${path.join('docs', 'index.html')}`, output);
      await waitForOutput(cli, `File generated in: ${path.join('docs', 'styles.css')}`, output);
      await waitForOutput(cli, 'Generation completed, you can find your files at ./docs', output);
    } catch (error) {
      console.error(error);
      throw error;
    } 
    finally {
      if (!cli.killed) {
        cli.kill();
      }
    }
  }, 10000);

  const extensions: {extension: string, selectIndex: number}[] = [
    { extension: '.ts', selectIndex: 0 }, 
    { extension: '.cjs', selectIndex: 1 },
    { extension: '.mjs', selectIndex: 2 },
    { extension: '.json', selectIndex: 3 } 
  ];

  test.each(extensions)(`CLI run with missing config, creates default ($extension)`,
    async (item) => {
      deleteOldDocGenConfigs();
      const cli = spawn('node', [cliPath], {   stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, CI: 'false', FORCE_COLOR: '1', FORCE_INTERACTIVE: 'true' } });

      const output = { text: '' };
      const errors: string[] = [];

      cli.stderr?.on('data', (chunk) => {
        const errorText = chunk.toString();
        errors.push(errorText);
        console.error('CLI error:', errorText);
      });

      try {
        await waitForOutput(cli, 'DocGen starting', output);
        await waitForOutput(cli, 'Config not found, would you like to use a default one?', output);
        await waitForOutput(cli, 'Pick a config format', output);

        for (let i = 0; i < item.selectIndex; i++) {
          cli.stdin?.write('\x1b[B');
        }

        cli.stdin?.write('\r');
        await waitForOutput(cli, `default config created: docgen.config${item.extension}`, output);  

        await waitForOutput(cli, 'Config found and parsed successfully', output);
        await waitForOutput(cli, `Found ${expectedDefaultPages.length} test files`, output);
        for (const page of expectedDefaultPages) { 
          const filePath = path.join('docs', `${page}.html`);
          await waitForOutput(cli, `File generated in: ${filePath}`, output);
        }
        await waitForOutput(cli, `File generated in: ${path.join('docs', 'index.html')}`, output);
        await waitForOutput(cli, `File generated in: ${path.join('docs', 'styles.css')}`, output);
        await waitForOutput(cli, 'Generation completed, you can find your files at ./docs', output);
        expect(fs.existsSync(path.resolve(`./docgen.config${item.extension}`))).toBeTruthy();
      } catch (error) {
        console.error(error);
        throw error;
      } 
      finally {
        if (!cli.killed) {
          cli.kill();
        }
      }
    }, 10000);

  test('CLI run with missing config, default refused, exits', async () => {
    deleteOldDocGenConfigs();
    const cli = spawn('node', [cliPath], {   stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, CI: 'false', FORCE_COLOR: '1', FORCE_INTERACTIVE: 'true' } });

    const output = { text: '' };
    const errors: string[] = [];

    cli.stderr?.on('data', (chunk) => {
      const errorText = chunk.toString();
      errors.push(errorText);
      console.error('CLI error:', errorText);
    });

    try {
      await waitForOutput(cli, 'DocGen starting', output);
      await waitForOutput(cli, 'Config not found, would you like to use a default one?', output);
      await waitForOutput(cli, 'Pick a config format', output);
      cli.stdin?.write('\x1b[B');
      cli.stdin?.write('\x1b[B');
      cli.stdin?.write('\x1b[B');
      cli.stdin?.write('\x1b[B');
      cli.stdin?.write('\r');

      await waitForOutput(cli, 'Exiting.', output);

    } catch (error) {
      console.error(error);
      throw error;
    } 
    finally {
      if (!cli.killed) {
        cli.kill();
      }
    }
  }, 10000);

  test('CLI run with missing template folder, default refused exits', async () => {
    await copyDocGenConfig('./__tests__/configs/base.config.ts', '.ts');
    await deleteTemplateFolder();

    const cli = spawn('node', [cliPath], { stdio: ['pipe', 'pipe', 'pipe'], 
      env: { ...process.env, CI: 'false', FORCE_COLOR: '1', FORCE_INTERACTIVE: 'true' } });

    const output = { text: '' };
    const errors: string[] = [];

    cli.stderr.on('data', (chunk) => {
      const errorText = chunk.toString();
      errors.push(errorText);
      console.error('CLI error:', errorText);
    });

    try {
      await waitForOutput(cli, 'DocGen starting', output);
      await waitForOutput(cli, 'Templates folder not found, would you like to use the default ones?', output);
      cli.stdin?.write('\x1b[D');
      cli.stdin?.write('\r');
      await waitForOutput(cli, 'Cannot run without templates, exiting', output);
    } catch (error) {
      console.error(error);
      throw error;
    } 
    finally {
      if (!cli.killed) {
        cli.kill();
      }
      addTemplates();
    }
  });

  test('CLI run with missing template folder, creates new one ', async () => {
    await copyDocGenConfig('./__tests__/configs/base.config.ts', '.ts');
    await deleteTemplateFolder();

    const cli = spawn('node', [cliPath], { stdio: ['pipe', 'pipe', 'pipe'], 
      env: { ...process.env, CI: 'false', FORCE_COLOR: '1', FORCE_INTERACTIVE: 'true' } });

    const output = { text: '' };
    const errors: string[] = [];

    cli.stderr.on('data', (chunk) => {
      const errorText = chunk.toString();
      errors.push(errorText);
      console.error('CLI error:', errorText);
    });

    try {
      await waitForOutput(cli, 'DocGen starting', output);
      await waitForOutput(cli, 'Templates folder not found, would you like to use the default ones?', output);
      cli.stdin?.write('\r');
      await waitForOutput(cli, 'Default Templates folder added to ./Templates', output);

      await waitForOutput(cli, 'Config found and parsed successfully', output);
      await waitForOutput(cli, 'Found 6 test files', output);
      for (const page of ['cli.integration.test', 'components.test', 'config.test', 'pageBuilder.test', 'runSiteBuilder.test', 'treeBuilder.test']) { 
        const filePath = path.join('docs', `${page}.html`);
        await waitForOutput(cli, `File generated in: ${filePath}`, output);
      }
      await waitForOutput(cli, `File generated in: ${path.join('docs', 'index.html')}`, output);
      await waitForOutput(cli, `File generated in: ${path.join('docs', 'styles.css')}`, output);
      await waitForOutput(cli, 'Generation completed, you can find your files at ./docs', output);
    } catch (error) {
      console.error(error);
      throw error;
    } 
    finally {
      if (!cli.killed) {
        cli.kill();
      }
      addTemplates();
    }
  });

  test('CLI run without index.html, adds default file', async () => {
    removeFile('./Templates/index.html');

    const cli = spawn('node', [cliPath], { stdio: ['pipe', 'pipe', 'pipe'], 
      env: { ...process.env, CI: 'false', FORCE_COLOR: '1', FORCE_INTERACTIVE: 'true' } });

    const output = { text: '' };
    const errors: string[] = [];

    cli.stderr.on('data', (chunk) => {
      const errorText = chunk.toString();
      errors.push(errorText);
      console.error('CLI error:', errorText);
    });

    try {
      await waitForOutput(cli, 'DocGen starting', output);
      await waitForOutput(cli, 'index.html not found, would you like to use the default one?', output);
      cli.stdin?.write('\r');
      await waitForOutput(cli, 'Default index.html added to Templates folder', output);

      await waitForOutput(cli, 'Found 6 test files', output);
      for (const page of ['cli.integration.test', 'components.test', 'config.test', 'pageBuilder.test', 'runSiteBuilder.test', 'treeBuilder.test']) { 
        const filePath = path.join('docs', `${page}.html`);
        await waitForOutput(cli, `File generated in: ${filePath}`, output);
      }
      await waitForOutput(cli, `File generated in: ${path.join('docs', 'index.html')}`, output);
      await waitForOutput(cli, `File generated in: ${path.join('docs', 'styles.css')}`, output);
      await waitForOutput(cli, 'Generation completed, you can find your files at ./docs', output);
    } catch (error) {
      console.error(error);
      throw error;
    } 
    finally {
      if (!cli.killed) {
        cli.kill();
      }
      addTemplates();
    }
  });

  test('CLI run without index.html, refuse default, exits', async () => {
    removeFile('./Templates/index.html');

    const cli = spawn('node', [cliPath], { stdio: ['pipe', 'pipe', 'pipe'], 
      env: { ...process.env, CI: 'false', FORCE_COLOR: '1', FORCE_INTERACTIVE: 'true' } });

    const output = { text: '' };
    const errors: string[] = [];

    cli.stderr.on('data', (chunk) => {
      const errorText = chunk.toString();
      errors.push(errorText);
      console.error('CLI error:', errorText);
    });

    try {
      await waitForOutput(cli, 'DocGen starting', output);
      await waitForOutput(cli, 'index.html not found, would you like to use the default one?', output);
      cli.stdin?.write('\x1b[D'); // left arrow button!
      cli.stdin?.write('\r');   
      await waitForOutput(cli, 'Cannot run without all templates, exiting', output);
    } catch (error) {
      console.error(error);
      throw error;
    } 
    finally {
      if (!cli.killed) {
        cli.kill();
      }
      addTemplates();
    }
  });
});

describe('Cli output tests', () => {
  const expectedFiles = ['index.html', 'styles.css'];
  /*test('templateDirectory that exists but is empty insert defaults', async () => {
    await replaceDocGenConfig('.ts', './__tests__/configs/template/docgen.config.ts');

    const consoleSpy: ReturnType<typeof vi.spyOn> = vi.spyOn(console, 'error').mockImplementation(() => {});
    const outputDirectory = './__tests__/docs';
    const templateDirectory = './__tests__/no_template';
    const resolvedTemplatePath = path.join(process.cwd(), '__tests__', 'no_template');
    await createEmptyFolder(resolvedTemplatePath);

    await runCli();

    expect(fs.existsSync(outputDirectory)).toBe(true);
    expectGeneratedFiles(outputDirectory, expectedFiles, false);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining(`Source file does not exist: ${path.resolve(templateDirectory, 'index.html')}, aborting copy for this file`));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining(`Source file does not exist: ${path.resolve(templateDirectory, 'styles.css')}, aborting copy for this file`));

    consoleSpy.mockRestore();
    deleteEmptyFolder(resolvedTemplatePath);
  });*/
});

function removeFile (pathName: string) {
  const filePath = path.resolve(pathName);
  fs.rmSync(filePath, { force: true });
}

function waitForOutput (cli: any, 
  text: string, 
  output: { text: string },
  timeoutMs = 3000): Promise<void> {

  if (output.text.includes(text)) {
    resolve();
  }

  return new Promise((resolve, reject) => {
    if (output.text.includes(text)) {
      resolve();
      return;
    }
    
    const timeout = setTimeout(() => {
      cli.stdout.off('data', onData);
      reject(new Error(`Timeout waiting for output: "${text}". Got: "${output.text}"`));
    }, timeoutMs);

    function onData (chunk: Buffer) {
      output.text += chunk.toString();
      if (output.text.includes(text)) {
        clearTimeout(timeout);
        cli.stdout.off('data', onData);
        resolve();
      }
    }
    
    cli.stdout.on('data', onData);
  });
}

async function deleteOldDocGenConfigs () {
  const base = './docgen.config';
  const extensions = ['.ts', '.js', '.json', '.cjs', '.mjs'];
  extensions.forEach((ex: string) => {
    const configPath = path.resolve(base + ex);
    if (fs.existsSync(configPath)) {
      fs.rmSync(configPath);
    }
  });
}

async function copyDocGenConfig (source: string, extension: string) { 
  deleteOldDocGenConfigs();

  const src = path.resolve(source);
  const dest = path.resolve('./docgen.config' + extension);
  fs.copyFileSync(src, dest);
}

async function addTemplates (destination: string = './Templates') {
  const src = path.resolve('./dist/Defaults/Templates');
  const dest = path.resolve(destination);

  fs.cpSync(src, dest,{ 
    recursive: true,
    force: true 
  });
} 

async function deleteTemplateFolder (directory: string = './Templates') {
  const dir = path.resolve(directory);

  fs.rmSync(dir, { recursive: true, force: true });
}