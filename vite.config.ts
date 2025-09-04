import { defineConfig } from 'vite';
import * as path from 'path';
import commonjs from 'vite-plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/cli.ts'),
      name: 'docGenJs',
      fileName: () => `cli.cjs`,
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: ['fs', 'path', '@babel/traverse', 'jsdom'],
      plugins: [nodeResolve, commonjs]
    },
    target: 'node22',
    minify: false
  }
});