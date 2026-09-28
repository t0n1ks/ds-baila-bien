/**
 * Guard rails for the content layer. Run with `npm run check:content`.
 *
 *  1. de and en must expose exactly the same key structure — a missing key is
 *     how a section ends up stuck in the wrong language.
 *  2. every key in content.json must be declared in the Sveltia schema,
 *     because the CMS strips whatever it does not know about on save.
 *  3. the gallery lists must line up index by index across locales.
 *  4. the levels must line up too: same count, titles, bullets per level.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { load as loadYaml } from 'js-yaml';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const content = JSON.parse(readFileSync(resolve(root, 'src/content/content.json'), 'utf8'));
const schema = loadYaml(readFileSync(resolve(root, 'public/admin/config.yml'), 'utf8'));

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

// 1. locale parity
const de = paths(content.de).sort();
const en = paths(content.en).sort();
de.filter((p) => !en.includes(p)).forEach((p) => problems.push(`missing in en: ${p}`));
en.filter((p) => !de.includes(p)).forEach((p) => problems.push(`missing in de: ${p}`));

// 2. schema coverage
const declared = new Set(schemaPaths(schema.collections[0].files[0].fields));
paths(content).forEach((path) => {
  // list-of-scalars shows up as "x[]" in the schema and "x" in the data
  if (declared.has(path) || declared.has(`${path}[]`)) return;
  problems.push(`not declared in config.yml (CMS would strip it): ${path}`);
});

// 3. gallery alignment
const deItems = content.de.gallery.items;
const enItems = content.en.gallery.items;
if (deItems.length !== enItems.length) {
  problems.push(`gallery length differs: de=${deItems.length} en=${enItems.length}`);
}
deItems.forEach((item, i) => {
  if (enItems[i] && enItems[i].src !== item.src) {
    problems.push(`gallery[${i}] src differs: "${item.src}" vs "${enItems[i].src}"`);
  }
});

// 4. levels alignment: same cards, same number of bullets per card
const deLevels = content.de.levels.items;
const enLevels = content.en.levels.items;
if (deLevels.length !== enLevels.length) {
  problems.push(`levels length differs: de=${deLevels.length} en=${enLevels.length}`);
}
deLevels.forEach((level, i) => {
  const other = enLevels[i];
  if (!other) return;
  if (level.title !== other.title) {
    problems.push(`levels[${i}] title differs (names stay English): "${level.title}" vs "${other.title}"`);
  }
  if ((level.items || []).length !== (other.items || []).length) {
    problems.push(`levels[${i}] bullet count differs: de=${(level.items || []).length} en=${(other.items || []).length}`);
  }
  if (Boolean(level.focus) !== Boolean(other.focus) || Boolean(level.note) !== Boolean(other.note)) {
    problems.push(`levels[${i}] optional focus/note filled in one locale only`);
  }
});

if (problems.length) {
  console.error(`content check failed (${problems.length}):`);
  problems.forEach((p) => console.error(`  - ${p}`));
  process.exit(1);
}
console.log('content check passed: locales in sync, schema covers every key');
