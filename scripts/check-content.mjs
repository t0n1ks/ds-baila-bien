/**
 * Guard rails for the content layer. Run with `npm run check:content`.
 *
 *  1. de.json and en.json must expose exactly the same key structure and the
 *     same number of entries in every list (levels, bullets, rows, …) — a
 *     missing key is how a section ends up stuck in the wrong language.
 *  2. the Deutsch and English CMS entries must declare identical field lists,
 *     so a text sits in the same spot in both.
 *  3. every key in every content file must be declared in its CMS entry,
 *     because Sveltia strips whatever it does not know about on save.
 *  4. media files (gallery, events, instagram): each { de, en } text pair is
 *     either filled in both languages or empty in both.
 *  5. level titles stay identical (English) in both languages.
 */
import { readFileSync } from 'node:fs';
import { isDeepStrictEqual } from 'node:util';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { load as loadYaml } from 'js-yaml';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const schema = loadYaml(readFileSync(resolve(root, 'public/admin/config.yml'), 'utf8'));
const entries = schema.singletons.filter((entry) => entry.file);

const problems = [];

/** Key paths of an object, descending into objects and into list items. */
function paths(value, prefix = '') {
  if (Array.isArray(value)) {
    // Lists are homogeneous: the first entry defines the shape.
    return typeof value[0] === 'object' && value[0] !== null ? paths(value[0], `${prefix}[]`) : [prefix];
  }
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, child]) =>
      paths(child, prefix ? `${prefix}.${key}` : key),
    );
  }
  return [prefix];
}

/** The same, derived from the CMS field definitions. */
function schemaPaths(fields, prefix = '') {
  return fields.flatMap((field) => {
    const here = prefix ? `${prefix}.${field.name}` : field.name;
    if (field.widget === 'object') return schemaPaths(field.fields, here);
    if (field.widget === 'list') {
      if (field.fields) return schemaPaths(field.fields, `${here}[]`);
      return [`${here}[]`];
    }
    return [here];
  });
}

/** Every list in `value` with its length, keyed by concrete path (a.b[2].c). */
function listLengths(value, prefix = '', out = new Map()) {
  if (Array.isArray(value)) {
    out.set(prefix, value.length);
    value.forEach((item, i) => listLengths(item, `${prefix}[${i}]`, out));
  } else if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, child]) => listLengths(child, prefix ? `${prefix}.${key}` : key, out));
  }
  return out;
}

/** Every { de, en } pair in `value`, with its concrete path. */
function localizedPairs(value, prefix = '', out = []) {
  if (Array.isArray(value)) {
    value.forEach((item, i) => localizedPairs(item, `${prefix}[${i}]`, out));
  } else if (value && typeof value === 'object') {
    const keys = Object.keys(value).sort().join(',');
    if (keys === 'de,en') out.push([prefix, value]);
    else Object.entries(value).forEach(([key, child]) => localizedPairs(child, prefix ? `${prefix}.${key}` : key, out));
  }
  return out;
}

const files = Object.fromEntries(
  entries.map((entry) => [entry.name, JSON.parse(readFileSync(resolve(root, entry.file), 'utf8'))]),
);
const { de, en } = files;

// 1. locale parity: structure and list lengths
const dePaths = paths(de).sort();
const enPaths = paths(en).sort();
dePaths.filter((p) => !enPaths.includes(p)).forEach((p) => problems.push(`missing in en.json: ${p}`));
enPaths.filter((p) => !dePaths.includes(p)).forEach((p) => problems.push(`missing in de.json: ${p}`));
const deLists = listLengths(de);
const enLists = listLengths(en);
deLists.forEach((length, path) => {
  if (enLists.has(path) && enLists.get(path) !== length) {
    problems.push(`list length differs at ${path}: de=${length} en=${enLists.get(path)}`);
  }
});

// 2. identical CMS field lists for Deutsch and English
const deEntry = entries.find((entry) => entry.name === 'de');
const enEntry = entries.find((entry) => entry.name === 'en');
if (!isDeepStrictEqual(deEntry.fields, enEntry.fields)) {
  problems.push('config.yml: the Deutsch and English entries must declare identical fields');
}

// 3. schema coverage, per file
entries.forEach((entry) => {
  const declared = new Set(schemaPaths(entry.fields));
  paths(files[entry.name]).forEach((path) => {
    // list-of-scalars shows up as "x[]" in the schema and "x" in the data
    if (declared.has(path) || declared.has(`${path}[]`)) return;
    problems.push(`${entry.file}: not declared in config.yml (CMS would strip it): ${path}`);
  });
});

// 4. media texts: both languages filled, or both empty
['gallery', 'events', 'instagram'].forEach((name) => {
  localizedPairs(files[name]).forEach(([path, pair]) => {
    if (Boolean(String(pair.de ?? '').trim()) !== Boolean(String(pair.en ?? '').trim())) {
      problems.push(`${name}.json ${path}: filled in one language only (de="${pair.de}", en="${pair.en}")`);
    }
  });
});

// 5. level titles
de.levels.items.forEach((level, i) => {
  const other = en.levels.items[i];
  if (other && level.title !== other.title) {
    problems.push(`levels[${i}] title differs (names stay English): "${level.title}" vs "${other.title}"`);
  }
  if (other && (Boolean(level.focus) !== Boolean(other.focus) || Boolean(level.note) !== Boolean(other.note))) {
    problems.push(`levels[${i}] optional focus/note filled in one language only`);
  }
});

if (problems.length) {
  console.error(`content check failed (${problems.length}):`);
  problems.forEach((p) => console.error(`  - ${p}`));
  process.exit(1);
}
console.log(
  `content check passed: ${entries.length} files, de/en in sync (structure + list lengths), ` +
    'identical CMS fields for Deutsch/English, schema covers every key, media texts paired',
);
