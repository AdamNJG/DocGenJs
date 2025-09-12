import { setDefaultConfig, loadConfig } from './setupConfig';
import { offerToUseDefaults, templatesExist } from './setupTemplates';

async function checkForAndReplaceConfig () {
  console.log('DocGen starting');
  let config = await loadConfig();

  if (!config) {
    config = await setDefaultConfig();
  }

  if (!config) {
    console.error('unable to load or generate config');
    process.exit(1);
  }

  if (!templatesExist(config)) {
    await offerToUseDefaults(config);
  }

  return config;
}

export default checkForAndReplaceConfig;