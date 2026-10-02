// Coordinate-frame definitions adapted from the project's d3-celestial fork.
// Source: mardukasoka/d3-celestial celestial.js (Olaf Frohn, BSD-3-Clause upstream).
// Uranometria keeps catalogue coordinates immutable and transforms only display coordinates.
export const FRAME_EULER_DEG = Object.freeze({
  equatorial:[0.0,0.0,0.0],
  ecliptic:[0.0,0.0,23.4393],
  galactic:[93.5949,28.9362,-58.5988],
  supergalactic:[137.3100,59.5283,57.7303]
});
export const FRAME_LABELS = Object.freeze({
 equatorial:["North Celestial Pole","South Celestial Pole","Vernal Equinox · RA 0h"],
 ecliptic:["North Ecliptic Pole","South Ecliptic Pole","λ = 0° · Vernal Equinox"],
 galactic:["Galactic North","Galactic South","Galactic Centre","Galactic Anticentre"],
 supergalactic:["Supergalactic North","Supergalactic South","SGX +","SGX −"]
});
export function cartesianToLonLat([x,y,z]){const r=Math.hypot(x,y,z)||1;return [Math.atan2(y,x)*180/Math.PI,Math.asin(z/r)*180/Math.PI,r]}
export function lonLatToCartesian([lon,lat,r=1]){const L=lon*Math.PI/180,B=lat*Math.PI/180,c=Math.cos(B);return [r*c*Math.cos(L),r*c*Math.sin(L),r*Math.sin(B)]}
const d=Math.PI/180;
function transformDeg(c,e){let L=c[0]*d,B=c[1]*d,a=e[0]*d,b=e[1]*d,g=e[2]*d,t=2*Math.PI;L-=a;let x=Math.sin(B)*Math.sin(b)-Math.cos(B)*Math.cos(b)*Math.cos(L),y=-Math.cos(B)*Math.sin(L);let p=g+Math.atan2(y,x);if(p>Math.PI)p-=t;let z=Math.sin(B)*Math.cos(b)+Math.cos(B)*Math.sin(b)*Math.cos(L);return [p/d,Math.asin(Math.max(-1,Math.min(1,z)))/d]}
export function equatorialToFrame(lonLat,frame){return frame==="equatorial"?lonLat.slice(0,2):transformDeg(lonLat,FRAME_EULER_DEG[frame])}


// Convert coordinates between any supported spherical frame through ICRS/J2000.
// The inverse is solved as a rigid rotation matrix derived from the existing
// equatorialToFrame definition, keeping catalogue positions immutable.
function matVec(m,v){return [m[0][0]*v[0]+m[0][1]*v[1]+m[0][2]*v[2],m[1][0]*v[0]+m[1][1]*v[1]+m[1][2]*v[2],m[2][0]*v[0]+m[2][1]*v[1]+m[2][2]*v[2]]}
function transpose(m){return [[m[0][0],m[1][0],m[2][0]],[m[0][1],m[1][1],m[2][1]],[m[0][2],m[1][2],m[2][2]]]}
function frameMatrix(frame){
 if(frame==="equatorial")return [[1,0,0],[0,1,0],[0,0,1]];
 return [[1,0,0],[0,1,0],[0,0,1]].map(v=>{
   const ll=cartesianToLonLat(v),o=equatorialToFrame(ll,frame);
   return lonLatToCartesian([o[0],o[1],1]);
 }).reduce((m,col,i)=>{for(let r=0;r<3;r++)m[r][i]=col[r];return m},[[0,0,0],[0,0,0],[0,0,0]]);
}
const FRAME_MATRICES=Object.freeze({
 equatorial:frameMatrix("equatorial"),
 ecliptic:frameMatrix("ecliptic"),
 galactic:frameMatrix("galactic"),
 supergalactic:frameMatrix("supergalactic")
});
export function transformCartesian(position,fromFrame,toFrame){
 if(fromFrame===toFrame)return position.slice();
 const eq=matVec(transpose(FRAME_MATRICES[fromFrame]),position);
 return matVec(FRAME_MATRICES[toFrame],eq);
}
