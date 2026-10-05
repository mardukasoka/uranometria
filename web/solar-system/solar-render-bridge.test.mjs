import test from "node:test";
import assert from "node:assert/strict";
import {SolarFrame} from "./solar-frames.js";
import {composeSolarRenderRecord,composeSolarRenderSet} from "./solar-render-bridge.js";

const root=new SolarFrame("solar-system");
const sun=new SolarFrame("sun",root,[0,0,0]);

test("validated AU state composes into renderer metres with evidence intact",()=>{
  const r=composeSolarRenderRecord({
    entity:{entity_id:"mpc:1",name:"Ceres",kind:"asteroid",sources:["MPC"]},
    state:{entity_id:"mpc:1",position_au:{x:1,y:0,z:0},epoch_mjd_tt:61200,source:"MPC",source_record_id:"1",provenance_url:"mpc:test"},
    objectFrame:sun,cameraFrame:sun
  });
  assert.equal(r.ok,true);
  assert.equal(r.render_position_m[0],149597870700);
  assert.equal(r.evidence.source,"MPC");
  assert.equal(r.entity.entity_id,"mpc:1");
});

test("missing validated state fails closed",()=>{
  const r=composeSolarRenderRecord({
    entity:{entity_id:"mpc:x",name:"Unknown",kind:"asteroid"},
    state:null,objectFrame:sun,cameraFrame:sun
  });
  assert.equal(r.ok,false);
  assert.equal(r.reason,"missing-validated-position");
});

test("set composition separates rendered from missing",()=>{
  const entities=[
    {entity_id:"a",name:"A",kind:"asteroid"},
    {entity_id:"b",name:"B",kind:"centaur"}
  ];
  const set=composeSolarRenderSet({
    entities,
    states:[{entity_id:"a",position_au:{x:0,y:1,z:0}}],
    frameFor:()=>sun,cameraFrame:sun
  });
  assert.equal(set.rendered.length,1);
  assert.equal(set.missing.length,1);
  assert.equal(set.missing[0].entity.entity_id,"b");
});

test("camera-local subtraction occurs after frame composition",()=>{
  const earth=new SolarFrame("earth",sun,[1000,0,0]);
  const r=composeSolarRenderRecord({
    entity:{entity_id:"probe",name:"Probe",kind:"spacecraft"},
    state:{entity_id:"probe",position_au:{x:0,y:0,z:0}},
    objectFrame:earth,cameraFrame:sun,cameraLocal:[900,0,0]
  });
  assert.deepEqual(r.render_position_m,[100,0,0]);
  assert.equal(r.propagation_authority,"jpl-horizons");
});
