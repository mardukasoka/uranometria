import {galacticToIcrs,icrsToGalactic,angularSeparation,GALACTIC_DIRECTIONS} from './compass-coordinates.mjs';
import assert from 'node:assert/strict';
function close(actual,expected,tolerance=0.00001){assert.ok(Math.abs(actual-expected)<tolerance,`expected ${actual} ≈ ${expected}`)}
const gc=galacticToIcrs(0,0);close(gc.ra,266.40499,0.00002);close(gc.dec,-28.93617,0.00002);
for(const {l,b} of [...Object.values(GALACTIC_DIRECTIONS),{l:359.999,b:0},{l:123.4,b:-44.2},{l:15,b:89.9}]){
 const p=galacticToIcrs(l,b),q=icrsToGalactic(p.ra,p.dec);
 close(q.b,b);if(Math.abs(b)!==90)close(Math.min(Math.abs(q.l-l),360-Math.abs(q.l-l)),0);
 close(angularSeparation(p,p),0);
}
assert.throws(()=>galacticToIcrs(0,91));
assert.throws(()=>icrsToGalactic(NaN,0));
console.log('Cosmic Compass coordinate checks passed');
