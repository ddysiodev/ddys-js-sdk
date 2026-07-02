import { mkdir, readFile, rm, writeFile, copyFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const src = join(root, 'src');
const dist = join(root, 'dist');

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

const esmSource = await readFile(join(src, 'index.js'), 'utf8');
await writeFile(join(dist, 'index.js'), esmSource, 'utf8');

const cjsSource = esmSource
  .replace(
    /\nexport \{\n  DEFAULT_BASE_URL,[\s\S]*?\n\};\n\nexport default createDdysClient;\n?$/,
    `\nmodule.exports = {\n  DEFAULT_BASE_URL,\n  DdysApiError,\n  DdysNetworkError,\n  DdysParseError,\n  DdysTimeoutError,\n  DdysClient,\n  createDdysClient,\n  default: createDdysClient\n};\n`
  );

await writeFile(join(dist, 'index.cjs'), cjsSource, 'utf8');
await copyFile(join(src, 'index.d.ts'), join(dist, 'index.d.ts'));

console.log('Built dist/index.js, dist/index.cjs, and dist/index.d.ts');

