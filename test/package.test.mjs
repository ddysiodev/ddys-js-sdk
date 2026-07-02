import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname } from 'node:path';
import { createRequire } from 'node:module';

const root = dirname(dirname(fileURLToPath(import.meta.url)));

test('package exposes ESM, CJS, and declarations after build', async () => {
  assert.equal(existsSync(join(root, 'dist/index.js')), true);
  assert.equal(existsSync(join(root, 'dist/index.cjs')), true);
  assert.equal(existsSync(join(root, 'dist/index.d.ts')), true);

  const esm = await import(pathToFileURL(join(root, 'dist/index.js')));
  assert.equal(typeof esm.createDdysClient, 'function');
  assert.equal(typeof esm.default, 'function');

  const require = createRequire(import.meta.url);
  const cjs = require(join(root, 'dist/index.cjs'));
  assert.equal(typeof cjs.createDdysClient, 'function');
  assert.equal(typeof cjs.default, 'function');
});

test('package.json has safe publish boundaries', async () => {
  const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
  assert.equal(pkg.type, 'module');
  assert.equal(pkg.exports['.'].types, './dist/index.d.ts');
  assert.deepEqual(pkg.files, ['dist', 'README.md', 'README.zh-CN.md', 'LICENSE']);
  assert.equal(pkg.publishConfig.access, 'public');
});
