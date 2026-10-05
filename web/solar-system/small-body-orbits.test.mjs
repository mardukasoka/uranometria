import {
  solveEccentricAnomaly, orbitalPositionAu, sampleOrbitAu,
  perihelionAphelionAu, populationChunk, classifyMpcElements
} from "./small-body-orbits.js";

const near=(a,b,eps=1e-9)=>Math.abs(a-b)<=eps;
const mag=p=>Math.hypot(p.x,p.y,p.z);
const assert=(ok,msg)=>{ if(!ok) throw new Error(msg); };

const circular={semimajor_axis_au:1,eccentricity:0,inclination_deg:0,
  ascending_node_deg:0,argument_perihelion_deg:0,mean_anomaly_deg:0};
assert(near(mag(orbitalPositionAu(circular)),1),"unit circular orbit radius");
assert(near(orbitalPositionAu(circular,90).x,0,1e-8),"quarter-orbit x");
assert(near(orbitalPositionAu(circular,90).y,1,1e-8),"quarter-orbit y");

const tilted={...circular,inclination_deg:90,mean_anomaly_deg:90};
assert(near(Math.abs(orbitalPositionAu(tilted).z),1,1e-8),"inclination rotates into z");

const ellipse={...circular,semimajor_axis_au:10,eccentricity:0.4};
const {q,Q}=perihelionAphelionAu(ellipse);
assert(near(q,6)&&near(Q,14),"q/Q relation");
assert(near(mag(orbitalPositionAu(ellipse,0)),q,1e-8),"perihelion geometry");
assert(near(mag(orbitalPositionAu(ellipse,180)),Q,1e-8),"aphelion geometry");

const pts=sampleOrbitAu(ellipse,64);
assert(near(pts[0].x,pts.at(-1).x,1e-8)&&near(pts[0].y,pts.at(-1).y,1e-8),"orbit closes");

for (const [label,expected] of [["Centaur","outer"],["Neptune Trojan","outer"],
 ["Apollo","inner"],["Jupiter Trojan","middle"],["detached TNO","outer"]]) {
  assert(populationChunk(label)===expected,`chunk: ${label}`);
}

assert(classifyMpcElements({a:20,e:0.2,q:16,Q:24,tisserandJupiter:3.5})===22,"MPC helper Centaur");
assert(classifyMpcElements({a:40,e:0.2,q:32,Q:48,tisserandJupiter:3.5})===23,"MPC helper TNO");

console.log("small-body-orbits: PASS");
