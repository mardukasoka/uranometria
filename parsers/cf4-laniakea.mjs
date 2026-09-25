#!/usr/bin/env node
// Normalize Laniakea/CF4 CSV products into compact Uranometria JSON.
// Usage:
//   node parsers/cf4-laniakea.mjs --galaxies path.csv --streamlines path.csv --out data/cf4
import fs from "node:fs";
import path from "node:path";

function args(argv) {
  const out = {};
  for (let i=2;i<argv.length;i+=2) out[argv[i]?.replace(/^--/,"")] = argv[i+1];
  return out;
}
function csv(text) {
  const lines=text.trim().split(/\r?\n/); if(!lines.length) return [];
  const h=lines[0].split(",").map(s=>s.trim());
  return lines.slice(1).filter(Boolean).map(line=>{
    const v=line.split(","); return Object.fromEntries(h.map((k,i)=>[k,v[i]?.trim()]));
  });
}
const num=(v)=>{const n=Number(v); return Number.isFinite(n)?n:null};
function write(file,obj){fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(obj));}

const a=args(process.argv), out=a.out ?? "data/cf4";\nconst lengthUnit=a["length-unit"] ?? "Mpc/h";\nif(!["Mpc","Mpc/h"].includes(lengthUnit)) throw new Error("--length-unit must be Mpc or Mpc/h");
if(!a.galaxies && !a.streamlines) throw new Error("provide --galaxies and/or --streamlines");

const provenance={
 source_type:"derived",
 citation:"manlius/laniakea CF4 Cosmography Pipeline; underlying Cosmicflows-4 / EDD products",
 dataset:"Cosmicflows-4",
 frame:"supergalactic",
 note:"Reconstruction product. Not a direct observation. Length unit is explicit and must match the exact upstream source product."
};

if(a.galaxies){
 const rows=csv(fs.readFileSync(a.galaxies,"utf8"));
 const objects=rows.map(r=>({
   id:r.pgc ? `PGC-${r.pgc}` : null,
   position:[num(r.SGX),num(r.SGY),num(r.SGZ)],
   distance_mpc:num(r.D_Mpc),
   basin_id:num(r.basin_id)
 })).filter(r=>r.position.every(Number.isFinite));
 write(`${out}/galaxies.json`,{version:"0.1.0",kind:"catalogue",frame:{coordinates:"supergalactic",units:lengthUnit},provenance,objects});
 console.log(`CF4 galaxies: ${objects.length}`);
}
if(a.streamlines){
 const rows=csv(fs.readFileSync(a.streamlines,"utf8"));
 const by=new Map();
 for(const r of rows){
   const id=String(r.streamline_id), p=[num(r.SGX),num(r.SGY),num(r.SGZ)];
   if(!p.every(Number.isFinite)) continue;
   if(!by.has(id)) by.set(id,{id,basin_id:num(r.basin_id),points:[]});
   by.get(id).points.push([num(r.vertex_idx),...p]);
 }
 const objects=[...by.values()].map(s=>({...s,points:s.points.sort((a,b)=>a[0]-b[0]).map(p=>p.slice(1))}));
 write(`${out}/streamlines.json`,{version:"0.1.0",kind:"reconstruction",frame:{coordinates:"supergalactic",units:lengthUnit},provenance:{...provenance,note:"RK4 streamline topology derived from reconstructed CF4 velocity field; point spacing is not velocity magnitude."},objects});
 console.log(`CF4 streamlines: ${objects.length}`);
}
