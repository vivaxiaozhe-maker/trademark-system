import { cpSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const source = resolve(root, 'trademark-system');
const output = resolve(root, 'docs');

rmSync(output, { recursive: true, force: true });
cpSync(source, output, { recursive: true });
console.log('Built GitHub Pages from trademark-system/ into docs/.');
