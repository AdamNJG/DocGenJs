import { DocGenConfig } from '../config';
import * as fs from 'fs';
import * as path from 'path';
import prompts from 'prompts';

export function templatesExist (config: DocGenConfig) : boolean {
  const templateDirectory = path.resolve(config.templateDirectory ?? './Templates');
  if (!fs.existsSync(templateDirectory)) {
    return false;
  }

  return true;
}

export function fileExists (config: DocGenConfig, file: string) : boolean {
  const templateDirectory = path.resolve(config.templateDirectory ?? './Templates');

  const filePath = path.join(templateDirectory, file);
  return fs.existsSync(filePath);
}

export async function offerToUseDefaults (config: DocGenConfig) {
  const response = await prompts({
    type: 'toggle',
    name: 'useDefaults',
    message: 'Templates folder not found, would you like to use the default ones?',
    initial: true,
    active: 'yes',
    inactive: 'no'
  });

  if (!response.useDefaults) {
    console.log('Cannot run without templates, exiting');
    process.exit(1);
  }

  const srcDir = path.resolve(__dirname, `../Defaults/Templates`);
  const templateDirectory = path.resolve(config.templateDirectory ?? './Templates');
  fs.cpSync(srcDir, templateDirectory, { recursive: true });
  console.log(srcDir);
  console.log(`Default Templates folder added to ${config.templateDirectory ?? './Templates'}`);
}

export async function offerToUseDefaultFile (config: DocGenConfig, file: string) {
  const response = await prompts({
    type: 'toggle',
    name: 'useDefaults',
    message: `${file} not found, would you like to use the default one?`,
    initial: true,
    active: 'yes',
    inactive: 'no'
  });

  if (!response.useDefaults) {
    console.log('Cannot run without all templates, exiting');
    process.exit(1);
  }

  const srcDir = path.resolve(__dirname, '../Defaults/Templates', file);
  const templateDirectory = path.resolve(config.templateDirectory ?? './Templates', file);
  fs.copyFileSync(srcDir, templateDirectory);
  console.log(`Default ${file} added to Templates folder`);
}