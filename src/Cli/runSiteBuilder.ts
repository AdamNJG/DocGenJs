import type { DocGenConfig } from '../Config/types.js';
import * as fs from 'fs';
import * as path from 'path';
import SiteBuilder from '../WebBuilder/SiteBuilder/siteBuilder.js';
import { Module } from 'module';
import ts from 'typescript';
import vm from 'vm';

async function runSiteBuilder () {
  console.log('DocGen starting');

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

async function loadConfig (): Promise<DocGenConfig | undefined> {
  const candidates = ['docgen.config.ts', 'docgen.config.js', 'docgen.config.json'];
  const projectRoot = process.cwd();

  for (const file of candidates) {
    const filePath = path.join(projectRoot, file);
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath).toLowerCase();

      switch (ext) {
      case '.json':
      {
        const json = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(json) as DocGenConfig;
      }
      case '.js':
        return (await import(filePath)).default as DocGenConfig;
      case '.ts':
        return importTsConfig(filePath);
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