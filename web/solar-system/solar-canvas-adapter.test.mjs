import test from "node:test";
import assert from "node:assert/strict";
import {renderRecordToCanvasPoint,renderSetToCanvasPoints} from "./solar-canvas-adapter.js";

test("composed metre position becomes display AU without losing metadata",()=>{
  const p=renderRecordToCanvasPoint({ok:true,entity:{entity_id:"x",name:"X",kind:"tno",population:"detached TNO",origin_status:"native"},render_position_m:[149597870700,0,-299195741400],epoch_mjd_tt:61200,propagation_authority:"mpc-elements",evidence:{source:"MPC"}});
  assert.deepEqual(p.position_au,[1,0,-2]);
  assert.equal(p.population,"detached TNO");
  assert.equal(p.evidence.source,"MPC");
});

test("invalid and fail-closed records never become draw primitives",()=>{
  assert.equal(renderRecordToCanvasPoint({ok:false}),null);
  assert.equal(renderRecordToCanvasPoint({ok:true,entity:{},render_position_m:[NaN,0,0]}),null);
  const pts=renderSetToCanvasPoints({rendered:[{ok:false}]});
  assert.equal(pts.length,0);
});
