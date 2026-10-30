import fs from 'node:fs';
import assert from 'node:assert/strict';
const root=new URL('../../',import.meta.url);
const read=p=>fs.readFileSync(new URL(p,root),'utf8');
const home=read('index.html');
const pages=[
'web/cosmic-web/cosmic-compass-gc-uv.html',
'web/cosmic-web/observatory-image-map.html',
'web/cosmic-web/cardinal-worldlines.html',
'web/cosmic-web/outer-solar-system.html'
];
for(const page of pages){
 assert.ok(fs.existsSync(new URL(page,root)),page+' missing');
 assert.ok(home.includes('./'+page),'landing page missing link to '+page);
 const html=read(page);
 assert.match(html,/<meta\s+name="viewport"/i,page+' missing mobile viewport');
 assert.match(html,/<title>/i,page+' missing title');
}
const uv=read(pages[0]);
for(const id of ['band','fov','pixels','status','load','external','fits','sia','view'])assert.ok(uv.includes('id="'+id+'"'),'UV viewer missing '+id);
assert.ok(uv.includes('skyview.gsfc.nasa.gov'),'UV viewer missing official source');
assert.ok(!uv.includes('Coverage verified.'),'UV viewer falsely claims verified coverage');
assert.ok(uv.includes('galex_gr7_misgcen_33205_0488_nuv_20261029.json'),'UV viewer must link its authenticated NUV evidence');
assert.ok(uv.includes('FUV coverage'),'UV viewer must distinguish unverified FUV coverage');
assert.ok(uv.includes('SkyView JPEG'),'UV viewer must distinguish archive NUV exposure from SkyView imagery');
const map=read(pages[1]);
assert.ok(map.includes('observatory-image-releases.json'),'release map missing catalogue');
assert.ok(map.includes('compass-coordinates.mjs'),'release map missing coordinate helper');
console.log('Cosmic Compass static page smoke checks passed');

// Branch integration guard: preserve existing main features and route previews to one implementation.
assert.ok(home.includes('./references.html'),'main simulation references link lost');
for(const [legacy,canonical] of [
  ['web/cosmic-web/preview/cosmic-compass-gc-uv.html','../cosmic-compass-gc-uv.html'],
  ['web/cosmic-web/preview/observatory-image-map.html','../observatory-image-map.html']]){
  const html=read(legacy);
  assert.match(html,/<meta\s+http-equiv="refresh"/i,legacy+' must redirect');
  assert.ok(html.includes(canonical),legacy+' must use canonical path');
  assert.ok(!html.includes('skyview.gsfc.nasa.gov'),legacy+' must not duplicate viewer');
}
assert.ok(read('web/cosmic-web/preview/compass-coordinates.mjs').includes("export * from '../compass-coordinates.mjs'"),'preview coordinate helper must re-export canonical implementation');
assert.equal(read('web/cosmic-web/preview/observatory-image-releases.json'),read('web/cosmic-web/observatory-image-releases.json'),'legacy JSON catalogue must match canonical catalogue');
