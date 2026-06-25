import { statSync } from 'node:fs';
import { join } from 'node:path';

const DIST_DIR = join(process.cwd(), 'dist');

const LIMITS = {
  'index.esm.js': 80 * 1024,
  'index.js': 80 * 1024,
  'core.esm.js': 80 * 1024,
  'core.js': 80 * 1024,
  'index.esm.css': 60 * 1024,
};

function formatKb(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

let failed = false;

for (const [fileName, maxBytes] of Object.entries(LIMITS)) {
  const filePath = join(DIST_DIR, fileName);
  const size = statSync(filePath).size;

  if (size > maxBytes) {
    console.error(
      `Bundle size exceeded for ${fileName}: ${formatKb(size)} > ${formatKb(maxBytes)}`
    );
    failed = true;
  } else {
    console.log(`OK ${fileName}: ${formatKb(size)} (limit ${formatKb(maxBytes)})`);
  }
}

if (failed) {
  process.exit(1);
}
