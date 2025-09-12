import { DocGenConfig } from '../config';
import * as fs from 'fs';
import * as path from 'path';
import readline from 'readline';

export function templatesExist (config: DocGenConfig) : boolean {
  const templateDirectory = path.resolve(config.templateDirectory ?? './templates');
  if (!fs.existsSync(templateDirectory)) {
    return false;
  }
  return true;
}

export async function offerToUseDefaults (config: DocGenConfig) {
  const result = await askYesNo('Templates folder not found, would you like to use the default ones?');
  if (!result) {
    return;
  }

  const srcDir = path.join(__dirname, '../Defaults/Templates');
  const templateDirectory = path.resolve(config.templateDirectory ?? './Templates');
  fs.cpSync(srcDir, templateDirectory, { recursive: true });
}

async function askYesNo (question: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(`${question} (y/n): `, answer => {
      rl.close();
      const normalized = answer.trim().toLowerCase();
      resolve(normalized === 'y' || normalized === 'yes');
    });
  });
}