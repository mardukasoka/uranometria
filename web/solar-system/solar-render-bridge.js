// Composition boundary: scientific entity + validated state + precision frame -> disposable render record.
// Renderer-neutral; no DOM/canvas/camera ownership.

import {normalizeSolarEntity,choosePropagationAuthority} from "./solar-entity-registry.js";
import {SolarFrame,relativePosition} from "./solar-frames.js";

const AU_M=149597870700;

export function composeSolarRenderRecord({entity,state,objectFrame,cameraFrame,cameraLocal=[0,0,0]}){
  const e=normalizeSolarEntity(entity);
  if(!(objectFrame instanceof SolarFrame)||!(cameraFrame instanceof SolarFrame)) throw new TypeError("SolarFrame required");
  if(!state?.position_au || !["x","y","z"].every(k=>Number.isFinite(state.position_au[k]))) {
    return {ok:false,entity:e,reason:"missing-validated-position"};
  }
  const local=[
    state.position_au.x*AU_M,
    state.position_au.y*AU_M,
    state.position_au.z*AU_M
  ];
  const renderPositionM=relativePosition(objectFrame,local,cameraFrame,cameraLocal);
  return Object.freeze({
    ok:true,
    entity:e,
    propagation_authority:state.propagation_model??choosePropagationAuthority(e),
    epoch_mjd_tt:state.epoch_mjd_tt??null,
    frame:objectFrame.name,
    render_position_m:Object.freeze(renderPositionM),
    evidence:Object.freeze({
      source:state.source??null,
      source_record_id:state.source_record_id??e.source_record_id,
      provenance_url:state.provenance_url??null,
      uncertainty:state.uncertainty??e.uncertainty
    })
  });
}

export function composeSolarRenderSet({entities=[],states=[],frameFor,cameraFrame,cameraLocal=[0,0,0]}){
  if(typeof frameFor!=="function") throw new TypeError("frameFor callback required");
  const byId=new Map(states.map(s=>[String(s.entity_id??s.id),s]));
  const rendered=[],missing=[];
  for(const raw of entities){
    const entity=normalizeSolarEntity(raw);
    const state=byId.get(entity.entity_id);
    const record=composeSolarRenderRecord({entity,state,objectFrame:frameFor(entity),cameraFrame,cameraLocal});
    (record.ok?rendered:missing).push(record);
  }
  return Object.freeze({rendered:Object.freeze(rendered),missing:Object.freeze(missing)});
}
