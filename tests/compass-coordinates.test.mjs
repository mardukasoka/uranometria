// Run: npm test  (node --test tests/*.test.mjs)
import test from 'node:test';
import assert from 'node:assert/strict';
import {icrsToGalactic, galacticToIcrs, angularSeparation} from '../web/cosmic-web/preview/compass-coordinates.mjs';

const close = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);

test('north galactic pole (IAU J2000) maps to b = +90', () => {
  close(icrsToGalactic(192.85948, 27.12825).b, 90, 1e-4, 'NGP b');
});

test('galactic centre maps to l = 0, b = 0', () => {
  const g = icrsToGalactic(266.40500, -28.93617);
  close(Math.min(g.l, 360 - g.l), 0, 1e-4, 'GC l');
  close(g.b, 0, 1e-4, 'GC b');
});

test('galactic <-> ICRS round trip', () => {
  for (let i = 0; i < 500; i++) {
    const l = (i * 7.31) % 360, b = ((i * 3.77) % 178) - 89;
    const r = galacticToIcrs(l, b), g = icrsToGalactic(r.ra, r.dec);
    close(((g.l - l + 540) % 360) - 180, 0, 1e-9, 'l');
    close(g.b, b, 1e-9, 'b');
  }
});

test('angularSeparation is accurate for sub-milliarcsecond separations', () => {
  close(angularSeparation({ra: 10, dec: 20}, {ra: 10, dec: 20 + 1e-7}), 1e-7, 1e-12, '1e-7 deg');
  close(angularSeparation({ra: 0, dec: 0}, {ra: 0, dec: 1 / 3.6e6}) * 3.6e6, 1, 1e-6, '1 mas');
});

test('angularSeparation large and antipodal separations', () => {
  close(angularSeparation({ra: 0, dec: 0}, {ra: 90, dec: 0}), 90, 1e-12, 'quarter');
  close(angularSeparation({ra: 0, dec: 0}, {ra: 180, dec: 0}), 180, 1e-12, 'antipode');
  close(angularSeparation({ra: 0, dec: 90}, {ra: 123, dec: -90}), 180, 1e-12, 'poles');
});

test('angularSeparation rejects invalid input instead of returning NaN', () => {
  assert.throws(() => angularSeparation({ra: NaN, dec: 0}, {ra: 0, dec: 0}));
  assert.throws(() => angularSeparation({ra: 0, dec: 95}, {ra: 0, dec: 0}));
  assert.throws(() => angularSeparation(null, {ra: 0, dec: 0}));
});
