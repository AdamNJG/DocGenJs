import * as fs from 'fs';
import { expect } from 'vitest';
import * as path from 'path';
import { DocGenConfig } from '../../src/config';

export function createEmptyFolder (emptyFolderPath: string) { 
  if (!fs.existsSync(emptyFolderPath)) {
    return fs.promises.mkdir(emptyFolderPath);
  }
}

export function deleteEmptyFolder (emptyFolderPath: string) { 
  fs.promises.rm(emptyFolderPath, { recursive: true, force: true });
}

export function expectGeneratedFiles (dir: string, files: string[], shouldBeTrue: boolean = true) {
  for (const file of files) {
    expect(fs.existsSync(path.join(dir, file)), `file: ${file} not found`).toBe(shouldBeTrue);
  }
}

export function checkGeneratedPages (expectedContents: Record<string, (doc: Document) => void>, config: DocGenConfig) {
  Object.entries(expectedContents).forEach(([key, expectFunction]) => {
    const doc = getOutputtedDocument(key, config.outputDirectory ?? '');
    expectFunction(doc);
  });
}

function getOutputtedDocument (page: string, outputDirectory: string): Document { 
  const joinedPath = path.join(outputDirectory, page);
  const resolvedPath = path.resolve(joinedPath);

  const html = fs.readFileSync(resolvedPath, 'utf-8');
  const parser = new DOMParser();
  return parser.parseFromString(html, 'text/html');
}

export function checkMain (document: Document) {
  const nav = document.querySelector('.pages-nav');
  expect(nav).not.toBe(null);
}

export function checkPage (document: Document) { 
  const module = document.querySelector('.module-component');
  expect(module).not.toBe(null);
}

export function removeOutputDirectory (directory: string) {
  const resolvedPath = path.resolve(directory);
  return fs.promises.rm(resolvedPath, { recursive: true, force: true });
}