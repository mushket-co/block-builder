import { execSync } from 'child_process';
import path from 'path';

const rootDir = path.resolve(__dirname, '../..');

export default async function globalSetup(): Promise<void> {
  execSync('npm run build', {
    cwd: rootDir,
    stdio: 'inherit',
  });
}
