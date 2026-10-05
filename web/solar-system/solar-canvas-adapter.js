// Display-only projection adapter for the lightweight Outer Solar System canvas.
// Scientific records stay in solar-render-bridge.js; this module only prepares draw primitives.

const AU_M=149597870700;

export function renderRecordToCanvasPoint(record){
  if(!record?.ok || !Array.isArray(record.render_position_m) || record.render_position_m.length!==3) return null;
  const p=record.render_position_m.map(Number);
  if(!p.every(Number.isFinite)) return null;
  return Object.freeze({
    id:record.entity.entity_id,
    label:record.entity.name,
    kind:record.entity.kind,
    population:record.entity.population??null,
    origin_status:record.entity.origin_status??"unknown",
    position_au:Object.freeze(p.map(v=>v/AU_M)),
    epoch_mjd_tt:record.epoch_mjd_tt??null,
    propagation_authority:record.propagation_authority??null,
    evidence:record.evidence??null
  });
}

export function renderSetToCanvasPoints(set){
  return Object.freeze((set?.rendered??[]).map(renderRecordToCanvasPoint).filter(Boolean));
}
