import type { DocGenConfig } from '../Config/types.js';
import * as fs from 'fs';
import * as path from 'path';
import SiteBuilder from '../WebBuilder/SiteBuilder/siteBuilder.js';

async function runSiteBuilder () {

  const configFile = findConfig();
  let config: DocGenConfig;

  if (configFile) {
    const imported = await import(pathToFileUrl(configFile).href);
    config = imported.default;
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

function findConfig (): string | undefined {
  const candidates = ['docgen.config.ts', 'docgen.config.js'];
  for (const file of candidates) {
    const fullPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(fullPath)) return fullPath;
  }
  return undefined;
}

function pathToFileUrl (filePath: string): URL {
  const resolved = path.resolve(filePath);
  return new URL(`file://${resolved}?imported=${Date.now()}`);
}

export default runSiteBuilder;