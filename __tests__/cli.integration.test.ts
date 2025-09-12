
import { test, expect, describe } from 'vitest';
import { spawn } from 'node:child_process';

const cliPath = './dist/cli.mjs';

describe('cli flow tests', () => {
  test('CLI run with correct ', async () => {
    const cli = spawn('node', [cliPath], { stdio: ['pipe', 'pipe', 'pipe'] });

    const output = { text: '' };
    const errors: string[] = [];

    cli.stderr.on('data', (chunk) => {
      const errorText = chunk.toString();
      errors.push(errorText);
      console.error('CLI error:', errorText);
    });

    try {
      await waitForOutput(cli, 'DocGen starting', output);
      await waitForOutput(cli, 'Config found and parsed successfully', output);
      await waitForOutput(cli, 'Found 6 test files', output);
      for (const page of ['cli.integration.test', 'components.test', 'config.test', 'pageBuilder.test', 'runSiteBuilder.test', 'treeBuilder.test']) { 
        await waitForOutput(cli, `File generated in: docs\\${page}.html`, output);
      }
      await waitForOutput(cli, `File generated in: docs\\index.html`, output);
      await waitForOutput(cli, `File generated in: docs\\styles.css`, output);
      await waitForOutput(cli, 'Generation completed, you can find your files at ./docs', output);
      cli.on('close', (code) => {
        expect(code).toBe(0);
      });
    } finally {
      if (!cli.killed) {
        cli.kill();
      }
    }
  });

  /*test('CLI handles invalid input gracefully', async () => {
    const cli = spawn('node', [cliPath], { stdio: ['pipe', 'pipe', 'pipe'] });

    const output = { text: '' };

    try {
      await waitForOutput(cli, "What's your name?", output);
      cli.stdin.write('\n'); // Empty input

      await waitForOutput(cli, "What's your favorite color?", output);
      cli.stdin.write('   \n'); // Whitespace only

      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          cli.kill();
          reject(new Error('CLI process timed out'));
        }, 5000);

        cli.on('close', (code) => {
          clearTimeout(timeout);
          // Test that CLI handles edge cases appropriately
          expect(code).toBe(0);
          resolve();
        });
      });
    } finally {
      if (!cli.killed) {
        cli.kill();
      }
    }
  });*/
});

function waitForOutput (cli: any, 
  text: string, 
  output: { text: string },
  timeoutMs = 3000): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      cli.stdout.off('data', onData);
      reject(new Error(`Timeout waiting for output: "${text}". Got: "${output.text}"`));
    }, timeoutMs);

    function onData (chunk: Buffer) {
      output.text += chunk.toString();
      if (output.text.includes(text)) {
        clearTimeout(timeout);
        cli.stdout.off('data', onData);
        resolve();
      }
    }
    
    cli.stdout.on('data', onData);
  });
}