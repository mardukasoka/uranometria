import test from "node:test";
import assert from "node:assert/strict";
import {SolarFrame} from "./solar-frames.js";
import {composeSolarRenderSet} from "./solar-render-bridge.js";
import {CROSS_DOMAIN_ENTITIES,crossDomainEntity} from "./cross-domain-fixtures.js";

test("three spacecraft and three confirmed interstellar validators exist",()=>{
  assert.equal(CROSS_DOMAIN_ENTITIES.filter(e=>e.kind==="spacecraft").length,3);
  assert.equal(CROSS_DOMAIN_ENTITIES.filter(e=>e.origin_status==="confirmed-interstellar").length,3);
});

test("interstellar validators are hyperbolic without changing identity kind",()=>{
  for(const id of ["sb:1I","sb:2I","sb:3I"]){
    const e=crossDomainEntity(id);
    assert.equal(e.kind,"interstellar-object");
    assert.ok(e.orbit_facets.includes("hyperbolic"));
  }
});

test("cross-domain fixtures remain invisible without validated states",()=>{
  const root=new SolarFrame("root");
  const sun=new SolarFrame("sun",root);
  const set=composeSolarRenderSet({entities:CROSS_DOMAIN_ENTITIES,states:[],frameFor:()=>sun,cameraFrame:sun});
  assert.equal(set.rendered.length,0);
  assert.equal(set.missing.length,CROSS_DOMAIN_ENTITIES.length);
});

test("spacecraft and interstellar object share render bridge but retain authority and origin",()=>{
  const root=new SolarFrame("root");
  const sun=new SolarFrame("sun",root);
  const states=[
    {entity_id:"sc:voyager1",position_au:{x:160,y:0,z:0},epoch_mjd_tt:61200,source:"fixture"},
    {entity_id:"sb:1I",position_au:{x:40,y:20,z:5},epoch_mjd_tt:61200,source:"fixture"}
  ];
  const entities=[crossDomainEntity("sc:voyager1"),crossDomainEntity("sb:1I")];
  const set=composeSolarRenderSet({entities,states,frameFor:()=>sun,cameraFrame:sun});
  assert.equal(set.rendered.length,2);
  const v=set.rendered.find(r=>r.entity.entity_id==="sc:voyager1");
  const i=set.rendered.find(r=>r.entity.entity_id==="sb:1I");
  assert.equal(v.propagation_authority,"jpl-horizons");
  assert.equal(i.propagation_authority,"jpl-horizons");
  assert.equal(i.entity.origin_status,"confirmed-interstellar");
  assert.equal(v.entity.origin_status,"native");
});
