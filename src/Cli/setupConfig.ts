import * as path from 'path';
import * as fs from 'fs';
import prompts from 'prompts';
import { DocGenConfig } from '../config';
import { Module } from 'module';
import ts from 'typescript';
import vm from 'vm';

export async function setDefaultConfig () : Promise<DocGenConfig> {
  const srcDir = path.join(__dirname, '../Defaults/docgen.config');
  const destDir = path.join(process.cwd(), 'docgen.config');

  if (!process.stdin.isTTY && !process.env.FORCE_INTERACTIVE) {
    console.log('Non-interactive environment, using default config (.js CommonJS)');
    const src = srcDir + '.cjs';
    const dest = destDir + '.js';
    fs.copyFileSync(src, dest);

    const config = await import(src); 
    return (config.default ?? config) as DocGenConfig;
  }

  const choices = ['.ts', '.js (CommonJS)', '.js (Module)', 'JSON', '(EXIT)'];
  console.log('Config not found, would you like to use a default one?');

  const response = await prompts({
    type: 'select',
    name: 'value',
    message: 'Pick a config format',
    choices: choices.map(choice => ({ title: choice, value: choice }))
  });

  switch (response.value) {
  case '.ts': {
    const extension = '.ts';
    const src = srcDir + extension;
    const dest = destDir + extension;
    fs.copyFileSync(src, dest);
    logCreatedConfig(extension);
    return importTsConfig(src);
  }
  case '.js (CommonJS)': {
    const extension = '.cjs';
    const src = srcDir + extension;
    const dest = destDir + extension;
    fs.copyFileSync(src, dest);
    logCreatedConfig(extension);
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const config = require(dest);
    return (config.default ?? config) as DocGenConfig;
  }
  case '.js (Module)': {
    const extension = '.mjs';
    const src = srcDir + extension;
    const dest = destDir + extension;
    fs.copyFileSync(src, dest);
    logCreatedConfig(extension);
    return (await import(dest)).default as DocGenConfig;
  }
  case 'JSON': {
    const extension = '.json';
    const src = srcDir + extension;
    const dest = destDir + extension;
    fs.copyFileSync(src, dest);
    logCreatedConfig(extension);
    const json = fs.readFileSync(dest, 'utf8');
    return JSON.parse(json);
  }
  case '(EXIT)':
    console.log('Exiting.');
    process.exit(1);
    break;
  default:
    console.log('Unexplained error: config');
    process.exit(1);
  }

}

function logCreatedConfig (extension: string) {
  console.log(`default config created: docgen.config${extension}`);
}

export async function loadConfig (): Promise<DocGenConfig | undefined> {
  const candidates = ['ts', 'js', 'json', 'cjs', 'mjs'];
  const projectRoot = process.cwd();

  for (const extension of candidates) {

    const filePath = path.join(projectRoot, 'docgen.config.' + extension);
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath).toLowerCase();

      switch (ext) {
      case '.json':
      {
        const json = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(json) as DocGenConfig;
      }
      case '.js':
      case '.cjs':
      case '.mjs':
        return (await import(filePath)).default as DocGenConfig;
      case '.ts':
        return importTsConfig(filePath) as DocGenConfig;
      default:
        return undefined;
      }
    }
  }
}

function importTsConfig (file: string) {
  const tsCode = fs.readFileSync(file, 'utf8');

  const jsCode = ts.transpileModule(tsCode, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true
    },
    fileName: path.basename(file)
  }).outputText;

  return loadTsModuleCjs(jsCode, file) as DocGenConfig;
}

function loadTsModuleCjs (jsCode: string, filename: string) : DocGenConfig {
  const m = { exports: {} };
  const wrapper = Module.wrap(jsCode); // Wraps code in function(exports, require, module, __filename, __dirname)
  const script = new vm.Script(wrapper, { filename });
  const func = script.runInThisContext();
  func(m.exports, require, m, filename, path.dirname(filename));
  const exported = m.exports as any;
  return (exported.default ?? exported) as DocGenConfig;
}
