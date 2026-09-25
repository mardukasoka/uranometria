export const FLOW_SHELLS = Object.freeze([50,100,160,200,300]);
export function shellBands(){let prev=0;return FLOW_SHELLS.map(r=>({min:prev,max:r,label:`${prev}–${r} h⁻¹ Mpc`,radius:r})).concat([{min:300,max:Infinity,label:">300 h⁻¹ Mpc",radius:null}]);}
export function assignShell(position){const r=Math.hypot(...position);return shellBands().find(s=>r<=s.max);}
export function decimateVectors(objects,maxVectors=800){if(objects.length<=maxVectors)return objects;const stride=objects.length/maxVectors;return Array.from({length:maxVectors},(_,i)=>objects[Math.floor(i*stride)]);}
