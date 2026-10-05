import {
  solveEccentricAnomaly, orbitalPositionAu, sampleOrbitAu,
  perihelionAphelionAu, populationChunk, classifyMpcElements,
  meanMotionRadPerDay, propagateTwoBody, heliocentricToPlanetRotatingFrame,
  heliocentricToPlanetCorotatingFrame, relativeLongitudeDeg
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


// Propagation invariants.
const epochOrbit={...circular,epoch_mjd_tt:60000};
const n1=meanMotionRadPerDay(1);
assert(near(n1,0.01720209895,1e-14),"Gaussian mean motion at 1 AU");
const siderealPeriodDays=2*Math.PI/n1;
const oneYear=propagateTwoBody(epochOrbit,60000+siderealPeriodDays);
assert(near(oneYear.mean_anomaly_deg,0,1e-8)||near(oneYear.mean_anomaly_deg,360,1e-8),"1 AU two-body orbit closes after Gaussian period");
assert(oneYear.perturbations_included===false,"propagator labels omitted perturbations");
assert(oneYear.propagation_precision==="visualization","propagator precision label");

const quarter=propagateTwoBody(epochOrbit,60000+siderealPeriodDays/4);
assert(near(quarter.mean_anomaly_deg,90,1e-8),"quarter-period mean anomaly");
const back=propagateTwoBody(quarter,60000);
assert(near(back.mean_anomaly_deg,0,1e-8)||near(back.mean_anomaly_deg,360,1e-8),"two-body propagation reversible");

// Rotating-frame invariants: coincident body is origin; fixed inertial offset rotates oppositely.
let rel=heliocentricToPlanetRotatingFrame({x:1,y:0,z:0},{x:1,y:0,z:0},Math.PI/3);
assert(near(mag(rel),0),"coincident planet/object maps to rotating origin");
rel=heliocentricToPlanetRotatingFrame({x:2,y:0,z:0},{x:1,y:0,z:0},Math.PI/2);
assert(near(rel.x,0,1e-8)&&near(rel.y,-1,1e-8),"rotating frame orientation");

console.log("propagation + rotating-frame invariants: PASS");


// Sun-centred pinned/co-rotating frame invariants.
const planet={x:0,y:2,z:0}; // longitude +90 deg
let cor=heliocentricToPlanetCorotatingFrame(planet,planet);
assert(near(cor.x,2,1e-8)&&near(cor.y,0,1e-8),"planet pinned to +x in Sun-centred co-rotating frame");
cor=heliocentricToPlanetCorotatingFrame({x:-2,y:0,z:0},planet);
assert(near(cor.x,0,1e-8)&&near(cor.y,2,1e-8),"co-rotating rotation sign");
assert(near(relativeLongitudeDeg({x:0,y:1,z:0},{x:1,y:0,z:0}),90,1e-8),"relative longitude +90");
assert(near(relativeLongitudeDeg({x:0,y:-1,z:0},{x:1,y:0,z:0}),-90,1e-8),"relative longitude -90");

console.log("Sun-centred co-rotating frame invariants: PASS");
