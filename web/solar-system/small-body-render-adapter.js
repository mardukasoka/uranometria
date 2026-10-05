// Adapter from the established small-body LOD0 catalogue to the common Solar entity contract.
// Keeps catalogue/display metadata out of the renderer and does not invent orbital state.

import {LOD0_OBJECTS,buildLod0RenderSet} from "./small-body-lod0.js";
import {composeSolarRenderSet} from "./solar-render-bridge.js";

function kindFor(o){
  const p=(o.population||"").toLowerCase();
  if(p.includes("centaur")) return "centaur";
  if(p.includes("tno")) return "tno";
  if(["Pluto","Eris","Haumea","Makemake","Ceres"].includes(o.name)) return "dwarf-planet";
  return "asteroid";
}

export function lod0SolarEntities(){
  return LOD0_OBJECTS.map(o=>({
    entity_id:o.id,
    designation:o.designation,
    name:o.name,
    kind:kindFor(o),
    parent_id:"sun",
    population:o.population,
    orbit_facets:o.resonance?["resonant",...(o.population==="Earth co-orbital"?["co-orbital"]:[])]:[],
    propagation_authority:"two-body-kepler",
    sources:["MPC"],
    metadata:{mpc_class:o.mpcClass??null,resonance:o.resonance??null,dynamical_class:o.dynamicalClass??null,provisional_designation:o.provisionalDesignation??null,lod:0}
  }));
}

export function buildComposedLod0({
  snapshots,targetEpochMjdTt,frameFor,cameraFrame,cameraLocal=[0,0,0],chunk=null
}){
  const legacy=buildLod0RenderSet(snapshots,targetEpochMjdTt,{chunk});
  const allowed=new Set(legacy.rendered.map(x=>x.id));
  const entities=lod0SolarEntities().filter(e=>allowed.has(e.entity_id));
  const states=legacy.rendered.map(r=>({
    entity_id:r.id,
    position_au:r.position_au,
    epoch_mjd_tt:r.render_epoch_mjd_tt,
    propagation_model:r.propagation_model,
    provenance_url:r.provenance?.url??null,
    source:r.provenance?.source??"MPC",
    source_record_id:r.designation
  }));
  const composed=composeSolarRenderSet({entities,states,frameFor,cameraFrame,cameraLocal});
  return Object.freeze({
    ...composed,
    missing:Object.freeze([
      ...composed.missing,
      ...legacy.missing.map(m=>Object.freeze({ok:false,entity_id:m.id,name:m.name,reason:m.reason}))
    ]),
    target_epoch_mjd_tt:legacy.target_epoch_mjd_tt
  });
}
