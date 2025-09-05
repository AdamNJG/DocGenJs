import { DocGenConfig } from './types';
import * as fs from 'fs';
import * as path from 'path';
import micromatch from 'micromatch';

type ValidationFailure = { validated: false, message: string };

type ConfigResult =
  | { validated: true, config: Config }
  | ValidationFailure

type ValidationResult = 
  | { validated: true, files: string[]}
  | ValidationFailure

type FilledConfig = {
  includes: string[];
  describeFunctionNameOverride: string;
  testFunctionNameOverride: string;
  testSuffixToRemove?: string;
  outputDirectory: string;
  templateDirectory: string;
  excludes?: string[];
  additionalFileExtensions: string[];
}

export default class Config {
  includes: string[];
  describeFunctionName: string;
  testFunctionName: string;
  testSuffixToRemove?: string;
  files: string[];
  outputDirectory: string;
  templateDirectory: string;

  private constructor (config: FilledConfig, files: string[]) {
    this.includes = config.includes;
    this.describeFunctionName = config.describeFunctionNameOverride;
    this.testFunctionName = config.testFunctionNameOverride;
    this.testSuffixToRemove = config.testSuffixToRemove;
    this.files = files;
    this.outputDirectory = config.outputDirectory;
    this.templateDirectory = config.templateDirectory;
  }

  static parse (config: DocGenConfig): ConfigResult {
    const updatedConfig = Config.applyDefaults(config);

    const validationResult = Config.validate(updatedConfig);

    return validationResult.validated === true ? 
      { validated: true, config: new Config(updatedConfig, validationResult.files) } 
      : validationResult;
  }

  static applyDefaults (config: DocGenConfig) : FilledConfig {
    const defaultFileExtensions = ['ts', 'js'];

    return { 
      ...config, 
      describeFunctionNameOverride: config.describeFunctionNameOverride ?? 'describe', 
      testFunctionNameOverride: config.testFunctionNameOverride ?? 'test',
      outputDirectory: config.outputDirectory ?? './docs',
      templateDirectory: config.templateDirectory ?? './templates',
      excludes: config.excludes ?? [],
      additionalFileExtensions: [...defaultFileExtensions, ...(config.additionalFileExtensions ?? [])]
    };
  }

  static validate (config: FilledConfig): ValidationResult {
    const files: string[] = [];

    if (!config.includes || config.includes.length === 0) {
      return { validated: false, message: `Test folder not specified, please add one to the includes array of the config` };
    }

    for (const folder of config.includes) {
      if (!fs.existsSync(folder)) {
        return { validated: false, message: `Test folder specified not found, looking for ${folder}` };
      }

      const rootFolder = path.resolve(folder);
      const folderFiles = Config.getAllFiles(rootFolder, config);
      if (folderFiles.length === 0) {
        return {  validated: false, message: `Folder: ${folder} was found, but is empty` };
      }

      if (!Config.hasValidEntryPoint(folderFiles, config)) {
        return { validated: false,
          message: `No describe or test functions found in ${config.includes} (looking for describe: ${config.describeFunctionNameOverride} or test: ${config.testFunctionNameOverride})`
        };
      }

      files.push(...folderFiles);
    }

    if (config.templateDirectory && !fs.existsSync(config.templateDirectory)) {
      return { validated: false, message: `Template folder specified not found, looking for ${config.templateDirectory}` };
    }
    
    return { validated: true, files: files };
  }

  static getAllFiles (dir: string, config: FilledConfig): string[] {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const files: string[] = [];
    const projectRoot = process.cwd();

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relPath = path.relative(projectRoot, fullPath).replace(/\\/g, '/'); 

      if (micromatch.isMatch(relPath, config.excludes ?? [], {})) {
        continue;
      }

      const extensionRegex = new RegExp(`\\.(${config.additionalFileExtensions.join('|')})$`);
      if (entry.isFile() && extensionRegex.test(fullPath)) {
        files.push(fullPath);
      } else if (entry.isDirectory()) {
        files.push(...Config.getAllFiles(fullPath, config));
      }
    }

    return files;
  }

  static hasValidEntryPoint (folderFiles: string[], config: FilledConfig) : boolean {
    return folderFiles.some(file => {
      const content: string = fs.readFileSync(file, 'utf-8');
      return content.includes(config.describeFunctionNameOverride) || content.includes(config.testFunctionNameOverride);
    });
  }

}