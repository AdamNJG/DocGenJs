import { defineConfig } from 'vite';
import * as path from 'path';
import commonjs from 'vite-plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';

/*export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: path.resolve(__dirname, 'src/cli.ts'),
      external: ['fs', 'path', '@babel/traverse', 'jsdom'],
      plugins: [nodeResolve, commonjs],
      output: {
        manualChunks (id ) { 
          const componentsPath = path.resolve(__dirname, 'src/WebBuilder/Components') + path.sep;
          if (id.startsWith(componentsPath)) {
            return path.basename(id, path.extname(id)); // each file -> own chunk
          }
        }
      }
    },
    target: 'node22',
    minify: false
  }
});*/

/*export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        'cli':  path.resolve(__dirname, 'src/cli.ts'),
        ...glob.sync('src/WebBuilder/Components/*.ts').reduce((entries, file) => {
          const name = path.basename(file, path.extname(file));
          entries[name] = path.resolve(__dirname, file);
          return entries;
        }, {})
      },
      external: ['fs', 'path', '@babel/traverse', 'jsdom']
    },
    target: 'node22',
    minify: false
  }
});*/