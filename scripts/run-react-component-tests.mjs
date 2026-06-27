#!/usr/bin/env node
/**
 * Runs React component tests against React 18 and 19.
 * Temporarily swaps root devDependencies via npm install --no-save, then restores lockfile state.
 */
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const MATRIX = [
  {
    label: 'React 18',
    packages: [
      'react@18.3.1',
      'react-dom@18.3.1',
      '@types/react@18.3.12',
      '@types/react-dom@18.3.1',
    ],
  },
  {
    label: 'React 19',
    packages: [
      'react@19.1.0',
      'react-dom@19.1.0',
      '@types/react@19.1.2',
      '@types/react-dom@19.1.2',
    ],
  },
];

function run(command) {
  execSync(command, { cwd: rootDir, stdio: 'inherit', shell: true });
}

for (const entry of MATRIX) {
  console.log(`\n[react-compat] Component tests — ${entry.label}\n`);
  run(`npm install --no-save ${entry.packages.join(' ')}`);
  run('npx vitest run tests/component/react');
}

console.log('\n[react-compat] Restoring default devDependencies…');
run('npm install --no-save react@^19.1.0 react-dom@^19.1.0 @types/react@^19.1.2 @types/react-dom@^19.1.2');

console.log('\n[react-compat] All React component matrices passed.\n');
