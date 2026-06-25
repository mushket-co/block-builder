import { build } from 'vite';
import vue from '@vitejs/plugin-vue';
import react from '@vitejs/plugin-react';
import { gzipSync, brotliCompressSync } from 'node:zlib';
import { mkdirSync, writeFileSync, readFileSync, rmSync, readdirSync } from 'node:fs';
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
  const chunkGraph = new Map();

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
        plugins: [
          {
            name: 'collect-size-chunk-graph',
            generateBundle(_options, bundle) {
              chunkGraph.clear();
              for (const item of Object.values(bundle)) {
                if (item.type !== 'chunk') {
                  continue;
                }
                chunkGraph.set(item.fileName, {
                  isEntry: item.isEntry,
                  imports: item.imports,
                });
              }
            },
          },
        ],
      },
    },
  });

  const jsFiles = readdirSync(outDir).filter(f => f.endsWith('.js') || f.endsWith('.mjs'));
  const initialJsFiles = new Set();
  const visitInitialChunk = fileName => {
    const chunk = chunkGraph.get(fileName);
    if (!chunk || initialJsFiles.has(fileName)) {
      return;
    }
    initialJsFiles.add(fileName);
    chunk.imports.forEach(visitInitialChunk);
  };

  for (const [fileName, chunk] of chunkGraph.entries()) {
    if (chunk.isEntry) {
      visitInitialChunk(fileName);
    }
  }

  const asyncJsFiles = jsFiles.filter(f => !initialJsFiles.has(f));
  const buf = Buffer.concat(jsFiles.map(f => readFileSync(join(outDir, f))));
  const initialBuf = Buffer.concat([...initialJsFiles].map(f => readFileSync(join(outDir, f))));
  const asyncBuf = Buffer.concat(asyncJsFiles.map(f => readFileSync(join(outDir, f))));
  results.push({
    name,
    initialRaw: initialBuf.length,
    initialGzip: gzipSync(initialBuf).length,
    initialBrotli: brotliCompressSync(initialBuf).length,
    asyncRaw: asyncBuf.length,
    raw: buf.length,
    gzip: gzipSync(buf).length,
    brotli: brotliCompressSync(buf).length,
  });
}

// CSS (общий для vue/react)
const css = readFileSync(resolve(root, 'dist/index.esm.css'));
results.push({
  name: 'CSS (vue/react)',
  initialRaw: css.length,
  initialGzip: gzipSync(css).length,
  initialBrotli: brotliCompressSync(css).length,
  asyncRaw: 0,
  raw: css.length,
  gzip: gzipSync(css).length,
  brotli: brotliCompressSync(css).length,
});

console.log('\nРеальный вес самого пакета (только конструктор, framework во external):\n');
console.log(
  'layer'.padEnd(20),
  'initial raw'.padStart(13),
  'initial gzip'.padStart(13),
  'async raw'.padStart(11),
  'total raw'.padStart(11),
  'total gzip'.padStart(12),
  'total br'.padStart(11)
);
console.log('-'.repeat(96));
for (const r of results) {
  console.log(
    r.name.padEnd(20),
    fmt(r.initialRaw).padStart(13),
    fmt(r.initialGzip).padStart(13),
    fmt(r.asyncRaw).padStart(11),
    fmt(r.raw).padStart(11),
    fmt(r.gzip).padStart(12),
    fmt(r.brotli).padStart(11)
  );
}

rmSync(tmp, { recursive: true, force: true });
