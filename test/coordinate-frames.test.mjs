import assert from "node:assert/strict";
import {lonLatToCartesian,cartesianToLonLat,transformCartesian} from "../lib/coordinate-frames.mjs";

const frames=["equatorial","ecliptic","galactic","supergalactic"];
const anchors=[
  [1,0,0],[0,1,0],[0,0,1],
  lonLatToCartesian([0,0,1]),
  lonLatToCartesian([90,0,1]),
  lonLatToCartesian([180,0,1]),
  lonLatToCartesian([270,0,1]),
  lonLatToCartesian([0,90,1])
];
const EPS=2e-10;
const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);

// A frame's own canonical axes must remain canonical when no frame change occurs.
for(const v of anchors) assert.ok(dist(transformCartesian(v,"galactic","galactic"),v)<EPS);

// Every supported frame conversion must round-trip without rotating or rescaling the physical vector.
for(const from of frames) for(const to of frames) for(const v of anchors){
  const q=transformCartesian(v,from,to);
  const back=transformCartesian(q,to,from);
  assert.ok(dist(back,v)<EPS, `${from}->${to}->${from} drift ${dist(back,v)}`);
  assert.ok(Math.abs(Math.hypot(...q)-Math.hypot(...v))<EPS, `${from}->${to} changed radius`);
}

// Explicit Galactic display compass: +X=GC, +Y=l90, -X=anticentre, -Y=l270, +Z=NGP.
const expected=[[0,0],[90,0],[180,0],[-90,0],[0,90]];
for(let i=0;i<5;i++){
  const ll=cartesianToLonLat(anchors[3+i]);
  assert.ok(Math.abs(ll[1]-expected[i][1])<1e-9);
  const lon=((ll[0]-expected[i][0]+540)%360)-180;
  assert.ok(Math.abs(lon)<1e-9);
}
console.log("coordinate-frame regression: PASS");
