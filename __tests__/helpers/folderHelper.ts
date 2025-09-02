import * as fs from 'fs';

export function createEmptyFolder (emptyFolderPath: string) { 
  if (!fs.existsSync(emptyFolderPath)) {
    return fs.promises.mkdir(emptyFolderPath);
  }
}

export function deleteEmptyFolder (emptyFolderPath: string) { 
  fs.promises.rm(emptyFolderPath, { recursive: true, force: true });
}