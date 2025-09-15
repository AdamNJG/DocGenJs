import { setDefaultConfig, loadConfig } from './setupConfig';
import { fileExists, offerToUseDefaultFile, offerToUseDefaults, templatesExist } from './setupTemplates';

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

  for (const file of ['index.html', 'styles.css', 'page.html']) {
    if (!fileExists(config, file)) {
      await offerToUseDefaultFile(config, file);
    }
  }

  return config;
}

export default checkForAndReplaceConfig;