import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');

function snapshot(directory) {
  const files = new Map();
  function walk(current) {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const path = resolve(current, entry.name);
      if (entry.isDirectory()) walk(path);
      else files.set(relative(directory, path), createHash('sha256').update(readFileSync(path)).digest('hex'));
    }
  }
  walk(directory);
  return files;
}

const source = snapshot(resolve(root, 'trademark-system'));
const output = snapshot(resolve(root, 'docs'));
const differences = new Set([...source.keys(), ...output.keys()].filter(
  (path) => source.get(path) !== output.get(path),
));

if (differences.size) {
  console.error('docs/ is stale. Run npm run build:pages. Differences:');
  for (const path of [...differences].sort()) console.error(`- ${path}`);
  process.exit(1);
}
console.log(`docs/ matches trademark-system/ (${source.size} files).`);
