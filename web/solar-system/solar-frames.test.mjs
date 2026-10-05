import test from "node:test";
import assert from "node:assert/strict";
import {SolarFrame,relativePosition,reexpressPosition} from "./solar-frames.js";

test("same-frame subtraction preserves local metre offsets",()=>{
  const root=new SolarFrame("root");
  const earth=new SolarFrame("earth",root,[149597870700,0,0]);
  assert.deepEqual(relativePosition(earth,[2,3,4],earth,[1,1,1]),[1,2,3]);
});

test("child-to-parent adds only the local frame chain",()=>{
  const root=new SolarFrame("root");
  const earth=new SolarFrame("earth",root,[1000,0,0]);
  const moon=new SolarFrame("moon",earth,[10,20,30]);
  assert.deepEqual(reexpressPosition(moon,[1,2,3],earth),[11,22,33]);
});

test("sibling frames subtract through lowest common ancestor",()=>{
  const root=new SolarFrame("root");
  const earth=new SolarFrame("earth",root,[100,0,0]);
  const mars=new SolarFrame("mars",root,[250,10,0]);
  assert.deepEqual(relativePosition(mars,[5,0,0],earth,[2,0,0]),[153,10,0]);
});

test("independent roots fail closed",()=>{
  const a=new SolarFrame("a"),b=new SolarFrame("b");
  assert.throws(()=>relativePosition(a,[0,0,0],b,[0,0,0]),/share a root/);
});
