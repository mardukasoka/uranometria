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
const map=read(pages[1]);
assert.ok(map.includes('observatory-image-releases.json'),'release map missing catalogue');
assert.ok(map.includes('compass-coordinates.mjs'),'release map missing coordinate helper');
console.log('Cosmic Compass static page smoke checks passed');
