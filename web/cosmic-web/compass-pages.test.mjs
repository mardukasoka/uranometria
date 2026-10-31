import fs from 'node:fs';
import assert from 'node:assert/strict';
import {galacticToIcrs,angularSeparation} from './compass-coordinates.mjs';
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

// Archive provenance regression gate: static evidence must not silently become a
// claim of independent astrometry, FUV coverage, source detection or deployment.
const evidence=JSON.parse(read('tools/evidence/galex_gr7_misgcen_33205_0488_nuv_20261029.json'));
assert.equal(evidence.observation.obsid,'5754');
assert.equal(evidence.observation.tile,'MISGCEN_33205_0488');
assert.equal(evidence.observation.band,'NUV');
assert.match(evidence.source,/MAST.*GALEX.*GR7/i);
for(const kind of ['int','exp','rr']){
  const product=evidence.products[kind];
  assert.match(product.filename,new RegExp('^MISGCEN_33205_0488-nd-'+kind+'\\.fits\\.gz$'));
  assert.match(product.dataURI,/^mast:GALEX\//);
  assert.match(product.sha256,/^[a-f0-9]{64}$/);
  assert.ok(Number.isSafeInteger(product.bytes)&&product.bytes>0);
}
for(const target of ['galactic_origin','sagittarius_a_star']){
  const t=evidence.targets[target];
  assert.ok(Array.isArray(t.icrs_deg)&&t.icrs_deg.length===2);
  assert.ok(t.icrs_deg.every(Number.isFinite));
  assert.ok(t.finite_intensity&&Number.isFinite(t.intensity_pixel));
  assert.ok(t.positive_exposure&&t.exposure_pixel>0);
  assert.ok(t.positive_response&&t.response_pixel>0);
  assert.ok(Number.isFinite(t.internal_wcs_residual_arcsec)&&t.internal_wcs_residual_arcsec<0.1);
  for(const kind of ['intensity','exposure','response']){
    const pixel=t[kind+'_wcs_pixel'];
    assert.ok(Array.isArray(pixel)&&pixel.length===2&&pixel.every(Number.isFinite));
  }
}
assert.ok(angularSeparation(
  {ra:evidence.targets.galactic_origin.icrs_deg[0],dec:evidence.targets.galactic_origin.icrs_deg[1]},
  galacticToIcrs(0,0))<0.2/3600,'Galactic origin differs from IAU transform');
assert.ok(angularSeparation(
  {ra:evidence.targets.galactic_origin.icrs_deg[0],dec:evidence.targets.galactic_origin.icrs_deg[1]},
  {ra:evidence.targets.sagittarius_a_star.icrs_deg[0],dec:evidence.targets.sagittarius_a_star.icrs_deg[1]})>1/60,
  'Galactic origin and Sgr A* must remain distinct positions');
for(const flag of ['independent_astrometry_verified','calibration_verified',
                   'artifact_masks_verified','source_detection_verified','live_deployment_verified',
                   'archive_checksum_crosschecked'])assert.equal(evidence.evidence[flag],false,flag+' must not be prematurely certified');
assert.match(evidence.fuv_status,/not an all-archive absence certification/i);
assert.ok(uv.includes('Archive-verified point coverage'));
assert.ok(uv.includes('This does not verify an ultraviolet source detection'));
console.log('Cosmic Compass GALEX evidence provenance checks passed');
