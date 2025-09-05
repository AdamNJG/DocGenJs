import fs from 'fs';
import path from 'path';


function renameJsToCjs(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      renameJsToCjs(fullPath); // recurse into subfolder
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      const newPath = fullPath.replace(/\.js$/, '.cjs');
      fs.renameSync(fullPath, newPath);
    }
  }
}

renameJsToCjs('./dist');