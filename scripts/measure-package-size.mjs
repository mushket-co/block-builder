import { build } from 'vite';
import vue from '@vitejs/plugin-vue';
import react from '@vitejs/plugin-react';
import { gzipSync, brotliCompressSync } from 'node:zlib';
import { mkdirSync, writeFileSync, readFileSync, rmSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const tmp = join(root, '.size-tmp');

rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });

const entries = {
  'api-usage (core)': {
    code: `export { BlockBuilder } from ${JSON.stringify(resolve(root, 'dist/core.esm.js'))};`,
    ext: 'js',
    external: [],
    plugins: [],
  },
  vue: {
    code: `export { default as BlockBuilderComponent } from ${JSON.stringify(resolve(root, 'src/vue/components/BlockBuilder.vue'))};`,
    ext: 'js',
    external: ['vue'],
    plugins: [vue()],
  },
  react: {
    code: `export { BlockBuilder } from ${JSON.stringify(resolve(root, 'src/react/components/BlockBuilder.tsx'))};`,
    ext: 'jsx',
    external: ['react', 'react-dom', 'react/jsx-runtime'],
    plugins: [react()],
  },
};

function fmt(n) {
  return `${(n / 1024).toFixed(2)} KB`;
}

const results = [];

for (const [name, cfg] of Object.entries(entries)) {
  const entryFile = join(tmp, `entry-${name.replace(/[^a-z]/gi, '')}.${cfg.ext}`);
  writeFileSync(entryFile, cfg.code);
  const outDir = join(tmp, `out-${name.replace(/[^a-z]/gi, '')}`);

  await build({
    root,
    logLevel: 'silent',
    configFile: false,
    plugins: cfg.plugins,
    build: {
      outDir,
      emptyOutDir: true,
      minify: 'terser',
      lib: {
        entry: entryFile,
        formats: ['es'],
        fileName: 'bundle',
      },
      rollupOptions: {
        external: cfg.external,
      },
    },
  });

  let raw = 0;
  for (const f of readdirSync(outDir)) {
    if (f.endsWith('.js') || f.endsWith('.mjs')) {
      raw += statSync(join(outDir, f)).size;
    }
  }
  const jsFiles = readdirSync(outDir).filter(f => f.endsWith('.js') || f.endsWith('.mjs'));
  const buf = Buffer.concat(jsFiles.map(f => readFileSync(join(outDir, f))));
  results.push({
    name,
    raw: buf.length,
    gzip: gzipSync(buf).length,
    brotli: brotliCompressSync(buf).length,
  });
}

// CSS (общий для vue/react)
const css = readFileSync(resolve(root, 'dist/index.esm.css'));
results.push({
  name: 'CSS (vue/react)',
  raw: css.length,
  gzip: gzipSync(css).length,
  brotli: brotliCompressSync(css).length,
});

console.log('\nРеальный вес самого пакета (только конструктор, framework во external):\n');
console.log(
  'layer'.padEnd(20),
  'raw'.padStart(11),
  'gzip'.padStart(11),
  'brotli'.padStart(11)
);
console.log('-'.repeat(56));
for (const r of results) {
  console.log(
    r.name.padEnd(20),
    fmt(r.raw).padStart(11),
    fmt(r.gzip).padStart(11),
    fmt(r.brotli).padStart(11)
  );
}

rmSync(tmp, { recursive: true, force: true });
