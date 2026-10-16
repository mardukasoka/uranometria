import fs from 'node:fs';
import assert from 'node:assert/strict';
const file=new URL('./observatory-image-releases.json',import.meta.url);
const data=JSON.parse(fs.readFileSync(file,'utf8'));
assert.equal(data.schema_version,1);
assert.ok(Array.isArray(data.releases));
const ids=new Set();
for(const [i,r] of data.releases.entries()){
 const prefix='releases['+i+']';
 assert.equal(typeof r.id,'string',prefix+'.id');assert.ok(r.id.trim());
 assert.ok(!ids.has(r.id),'duplicate release ID '+r.id);ids.add(r.id);
 for(const field of ['observatory','target','release_date','coordinate_basis','coordinate_frame','position_type']){
   assert.equal(typeof r[field],'string',prefix+'.'+field);assert.ok(r[field].trim(),prefix+'.'+field+' empty');
 }
 assert.match(r.release_date,/^\d{4}-\d{2}-\d{2}$/);
 assert.ok(!Number.isNaN(Date.parse(r.release_date)),'invalid release date '+r.release_date);
 assert.ok(Number.isFinite(r.ra_deg)&&r.ra_deg>=0&&r.ra_deg<360,prefix+'.ra_deg');
 assert.ok(Number.isFinite(r.dec_deg)&&r.dec_deg>=-90&&r.dec_deg<=90,prefix+'.dec_deg');
 assert.ok(Array.isArray(r.bands)&&r.bands.length>0,prefix+'.bands');
 for(const band of r.bands)assert.ok(['radio','microwave','submm','infrared','optical','uv','xray','gamma'].includes(band),prefix+'.bands '+band);
 assert.equal(typeof r.footprint_verified,'boolean',prefix+'.footprint_verified');
 const u=new URL(r.source_url);assert.equal(u.protocol,'https:',prefix+'.source_url');
 assert.equal(r.coordinate_frame,'ICRS/J2000',prefix+'.coordinate_frame');
 if(r.footprint_verified)assert.ok(r.footprint_source_url,'verified footprint requires a source');
}
console.log('Validated '+data.releases.length+' release records');
