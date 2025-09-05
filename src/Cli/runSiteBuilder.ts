import type { DocGenConfig } from '../Config/types.js';
import * as fs from 'fs';
import * as path from 'path';
import SiteBuilder from '../WebBuilder/SiteBuilder/siteBuilder.js';
import { Module } from 'module';
import ts from 'typescript';
import vm from 'vm';

async function runSiteBuilder () {

  const configFile = await loadConfig();
  let config: DocGenConfig;

  if (configFile) {
    config = configFile;
  } else {
    config = {
      includes: ['__tests__'],
      describeFunctionNameOverride: 'describe',
      testFunctionNameOverride: 'test'
    };
    console.log('Using default configuration. You can create a docgen.config.ts/js file to customise future runs.');
  }

  const siteBuilder = new SiteBuilder(config);
  siteBuilder.buildSite();
}

function pathToFileUrl (filePath: string): URL {
  const resolved = path.resolve(filePath);
  return new URL(`file://${resolved}?imported=${Date.now()}`);
}

async function loadConfig (): Promise<DocGenConfig | undefined> {
  const candidates = ['docgen.config.ts', 'docgen.config.js', 'docgen.config.json'];
  for (const file of candidates) {
    if (fs.existsSync(file)) {
      const ext = path.extname(file).toLowerCase();

      switch (ext) {
      case '.json':
      case '.js':
        return (await import(pathToFileUrl(file).href)).default as DocGenConfig;
      case '.ts':
        return importTsConfig(file);
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

export default runSiteBuilder;