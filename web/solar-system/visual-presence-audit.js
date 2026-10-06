// Solar-System visual-presence audit.
// Completion is fail-closed: catalogue identity alone never counts as rendered presence.
import {bestPositionFor} from "./best-position-policy.js";

export function auditVisualPresence({manifestObjects, evidenceByEntity, renderedEntityIds}) {
  const rendered=new Set(renderedEntityIds??[]);
  const rows=(manifestObjects??[]).map(object=>{
    const evidence=evidenceByEntity?.[object.entity_id]??{};
    const best=bestPositionFor(evidence);
    const hasPosition=best?.tier && best.tier!=="identity-only";
    const isRendered=hasPosition && rendered.has(object.entity_id);
    return Object.freeze({
      entity_id:object.entity_id,name:object.name,population:object.population,
      position_tier:best?.tier??"identity-only",
      position_badge:best?.badge??"NO POSITION",
      has_position:Boolean(hasPosition),rendered:Boolean(isRendered),
      pass:Boolean(hasPosition&&isRendered),
      reason:hasPosition?(isRendered?null:"position-resolved-not-rendered"):"no-defensible-position"
    });
  });
  const passed=rows.filter(r=>r.pass).length;
  return Object.freeze({
    required:rows.length,passed,failed:rows.length-passed,
    complete:rows.length>0&&passed===rows.length,
    rows:Object.freeze(rows)
  });
}
