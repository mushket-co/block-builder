/**
 * E2E preview servers for Playwright.
 * Builds the package once, then starts vue3 (:3001), pure-js (:3002) and react (:3004) previews.
 */
import { execSync, spawn } from 'child_process';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function run(command, args = []) {
  execSync([command, ...args].join(' '), {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true,
  });
}

function waitForUrl(url, timeoutMs = 120_000) {
  const deadline = Date.now() + timeoutMs;

  return new Promise((resolve, reject) => {
    const check = () => {
      const request = http.get(url, response => {
        response.resume();
        if (response.statusCode && response.statusCode < 500) {
          resolve();
          return;
        }
        retry();
      });

      request.on('error', retry);

      function retry() {
        if (Date.now() > deadline) {
          reject(new Error(`Timeout waiting for ${url}`));
          return;
        }
        setTimeout(check, 500);
      }
    };

    check();
  });
}

function startPreview(workspace) {
  return spawn('npm', ['run', 'preview', '--workspace', workspace], {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true,
  });
}

console.log('[e2e] Building @mushket-co/block-builder…');
run('npm', ['run', 'build']);

console.log('[e2e] Building examples…');
run('npm', ['run', 'build', '--workspace=examples/vue3']);
run('npm', ['run', 'build', '--workspace=examples/pure-js-vite']);
run('npm', ['run', 'build', '--workspace=examples/react']);

console.log('[e2e] Starting preview servers…');
const vue3 = startPreview('examples/vue3');
const pureJs = startPreview('examples/pure-js-vite');
const react = startPreview('examples/react');

const shutdown = () => {
  vue3.kill('SIGTERM');
  pureJs.kill('SIGTERM');
  react.kill('SIGTERM');
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
vue3.on('exit', code => {
  if (code && code !== 0) {
    shutdown();
    process.exit(code);
  }
});
pureJs.on('exit', code => {
  if (code && code !== 0) {
    shutdown();
    process.exit(code);
  }
});
react.on('exit', code => {
  if (code && code !== 0) {
    shutdown();
    process.exit(code);
  }
});

await Promise.all([
  waitForUrl('http://localhost:3001'),
  waitForUrl('http://localhost:3002'),
  waitForUrl('http://localhost:3004'),
]);

console.log('[e2e] Preview servers ready on :3001, :3002 and :3004');

await new Promise(() => {});
