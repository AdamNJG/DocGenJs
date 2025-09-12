import type { DocGenConfig } from '../Config/types.js';
import SiteBuilder from '../WebBuilder/SiteBuilder/siteBuilder.js';

async function runSiteBuilder (config: DocGenConfig) {
  const siteBuilder = new SiteBuilder(config);
  siteBuilder.buildSite();
}

export default runSiteBuilder;