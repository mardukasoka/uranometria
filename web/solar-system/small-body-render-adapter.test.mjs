import test from "node:test";
import assert from "node:assert/strict";
import {SolarFrame} from "./solar-frames.js";
import {lod0SolarEntities,buildComposedLod0} from "./small-body-render-adapter.js";

test("Leleākūhonua remains a detached TNO with explicit sednoid metadata",()=>{
  const e=lod0SolarEntities().find(x=>x.entity_id==="mpc:541132");
  assert.equal(e.name,"Leleākūhonua");
  assert.equal(e.population,"detached TNO");
  assert.equal(e.metadata.dynamical_class,"sednoid");
  assert.equal(e.metadata.provisional_designation,"2015 TG387");
});

test("Sedna also carries sednoid dynamical class",()=>{
  const e=lod0SolarEntities().find(x=>x.entity_id==="mpc:90377");
  assert.equal(e.metadata.dynamical_class,"sednoid");
});

test("empty validated snapshots remain entirely fail-closed",()=>{
  const root=new SolarFrame("root");
  const sun=new SolarFrame("sun",root);
  const set=buildComposedLod0({snapshots:[],targetEpochMjdTt:61200,frameFor:()=>sun,cameraFrame:sun});
  assert.equal(set.rendered.length,0);
  assert.equal(set.missing.length,lod0SolarEntities().length);
});

test("one validated LOD0 snapshot renders only that entity",()=>{
  const root=new SolarFrame("root");
  const sun=new SolarFrame("sun",root);
  const snapshot={entity_id:"mpc:541132",a:100,e:0.9,i:11,node:0,argperi:0,M:0,epoch_mjd_tt:61200,provenance:{source:"MPC",url:"mpc:test"}};
  const set=buildComposedLod0({snapshots:[snapshot],targetEpochMjdTt:61200,frameFor:()=>sun,cameraFrame:sun});
  assert.equal(set.rendered.length,1);
  assert.equal(set.rendered[0].entity.entity_id,"mpc:541132");
  assert.equal(set.missing.length,lod0SolarEntities().length-1);
});
