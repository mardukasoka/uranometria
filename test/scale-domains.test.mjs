import assert from "node:assert/strict";
import {SCALE_DOMAINS,transitionScaleDomain,assertOrientationInvariant} from "../lib/scale-domains.mjs";

for(const displayFrame of ["equatorial","ecliptic","galactic","supergalactic"]){
 let state={domain:SCALE_DOMAINS[0].id,displayFrame};
 for(const domain of SCALE_DOMAINS.slice(1)){
   const next=transitionScaleDomain(state,domain.id);
   assert.equal(next.displayFrame,displayFrame);
   assertOrientationInvariant(state,next);
   state=next;
 }
}
assert.throws(()=>assertOrientationInvariant({displayFrame:"galactic"},{displayFrame:"supergalactic"}));
console.log("scale-domain orientation regression: PASS");
