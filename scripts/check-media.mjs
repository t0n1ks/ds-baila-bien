/**
 * Lists files in public/images/uploads/ that nothing references, so the owner
 * can delete them by hand in the CMS Assets view. Run with `npm run check:media`.
 *
 * READ-ONLY: this script never deletes or modifies anything.
 *
 * A file counts as used when any text file in src/, index.html or public/
 * (outside the uploads folder itself) mentions "images/uploads/<name>" —
 * with or without a leading slash or the Pages base, URL-encoded or not.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, extname, join, relative, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const uploads = resolve(root, 'public/images/uploads');
const TEXT = new Set(['.json', '.js', '.jsx', '.mjs', '.ts', '.tsx', '.css', '.html', '.yml', '.yaml', '.md', '.webmanifest', '.svg']);

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return full === uploads ? [] : walk(full);
    return [full];
  });
}

const sources = [...walk(resolve(root, 'src')), ...walk(resolve(root, 'public')), resolve(root, 'index.html')]
  .filter((file) => TEXT.has(extname(file).toLowerCase()));

const referenced = new Set();
for (const file of sources) {
  const text = readFileSync(file, 'utf8');
  for (const [, name] of text.matchAll(/images\/uploads\/([^"'`\s)?#]+)/g)) {
    let decoded = name;
    try {
      decoded = decodeURIComponent(name);
    } catch {
      // keep the raw name
    }
    referenced.add(decoded.toLowerCase());
  }
}

const files = walk(uploads).filter((file) => !file.endsWith('.gitkeep'));
const unused = files
  .filter((file) => !referenced.has(relative(uploads, file).split('\\').join('/').toLowerCase()))
  .map((file) => ({ name: relative(uploads, file).split('\\').join('/'), size: statSync(file).size }));

const fmt = (bytes) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(2)} MB` : `${(bytes / 1024).toFixed(1)} KB`;

console.log(`Scanned ${files.length} file(s) in public/images/uploads/ against ${sources.length} source file(s).`);
if (!unused.length) {
  console.log('No unused media — every upload is referenced.');
} else {
  console.log(`\nUnused (${unused.length}) — safe to delete in /admin/ → Assets:`);
  const width = Math.max(...unused.map((u) => u.name.length));
  unused.forEach((u) => console.log(`  ${u.name.padEnd(width)}  ${fmt(u.size).padStart(10)}`));
  console.log(`\nTotal: ${fmt(unused.reduce((sum, u) => sum + u.size, 0))}`);
}
