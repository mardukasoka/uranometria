#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = __dirname;
const page = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const registry = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
const cards = [...page.matchAll(/<article class="card" data-group="([^"]+)">([\s\S]*?)<\/article>/g)];
const allowed = new Set(['established', 'alternative', 'research', 'speculative']);
function check(source, record) {
  const found = [...source.matchAll(/<article class="card" data-group="([^"]+)">([\s\S]*?)<\/article>/g)];
  assert.equal(found.length, 8, 'all eight frameworks must exist');
  const names = [];
  for (const [, group, html] of found) {
    assert.ok(allowed.has(group), 'invalid evidence class');
    const title = html.match(/<h2>([^<]+)<\/h2>/)?.[1];
    assert.ok(title, 'missing framework name');
    names.push(title);
    assert.match(html, /Limitation:/, 'missing limitation');
    assert.match(html, /<a href="https:\/\//, 'missing HTTPS reference');
  }
  assert.equal(new Set(names).size, 8, 'framework names must be unique');
  assert.ok(found.some(([, g, html]) => g === 'speculative' && /Chain Theory/.test(html) && /conjectural/.test(html)), 'Chain Theory physical status must remain conjectural');
  assert.match(record, /\*\*Mathematical claim\*\*:[^\n]+/);
  assert.match(record, /\*\*Physical conjecture\*\*:[^\n]+/);
  assert.match(record, /does not independently validate physical interpretation/);
}
check(page, registry);
for (const [name, brokenPage, brokenRegistry] of [
  ['missing framework', page.replace(cards[0][0], ''), registry],
  ['invalid evidence class', page.replace('data-group="established"', 'data-group="confirmed"'), registry],
  ['missing source', page.replace('<a href="https://home.cern/science/physics/standard-model">', '<span>'), registry],
  ['promoted Chain Theory', page.replace('data-group="speculative"', 'data-group="established"'), registry],
  ['missing physical conjecture', page, registry.replace(/- \*\*Physical conjecture\*\*:[^\n]+\n/, '')],
]) {
  assert.throws(() => check(brokenPage, brokenRegistry), undefined, name + ' must fail');
}
assert.match(page, /href="\.\.\/cosmology-simulations\/"/);
assert.ok(fs.existsSync(path.join(root, '../cosmology-simulations/index.html')));
console.log('Theory contract passed; five negative mutations correctly rejected.');
