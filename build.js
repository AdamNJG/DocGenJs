import { build } from 'esbuild';

/*build({
  entryPoints: ['src/index.ts'],   // your CLI entry point
  bundle: true,                    // bundle everything into one file
  platform: 'node',                // target Node.js
  target: ['node16'],              // adjust your Node target
  outfile: 'dist/index.js',        // output file
  format: 'esm',                   // ESM output
  external: [
    'fs', 'path', 'tty',  '@babel/traverse'
  ],        // keep Node built-ins external
  sourcemap: true,                 // optional: for debugging
}).catch(() => process.exit(1));*/

build({
  entryPoints: ['src/index.ts'],
  bundle: true,             // bundle your own code
  platform: 'node',
  target: ['node16'],
  outfile: 'dist/index.js',
  format: 'cjs',            // CJS for CLI
  external: [
    'fs', 'path', '@babel/traverse', 'jsdom'
  ],                        // do NOT bundle @babel/traverse
  sourcemap: true,
}).catch(() => process.exit(1));