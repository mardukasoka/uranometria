// Uranometria Solar-System entity contract.
// Scientific identity/evidence is separate from disposable render state.

export const SOLAR_ENTITY_KINDS=Object.freeze([
  "planet","dwarf-planet","natural-satellite","ring",
  "asteroid","centaur","tno","comet","interstellar-object",
  "spacecraft","artificial-satellite","dynamical-point"
]);

export const ORIGIN_STATUS=Object.freeze(["native","confirmed-interstellar","capture-candidate","unknown"]);
export const ORBIT_FACETS=Object.freeze(["prograde","retrograde","polar-high-i","hyperbolic","resonant","co-orbital","sun-grazing","sunskirter","sundiver","perihelion-inside-mercury","mercury-interior"]);
export const PHYSICAL_FACETS=Object.freeze(["fast-rotator","contact-binary","binary","active-asteroid","ringed","metal-rich","spacecraft-visited","sample-return","dark-comet-candidate","nongravitational-acceleration"]);

export const PROPAGATION_AUTHORITIES=Object.freeze({
  MPC_ELEMENTS:"mpc-elements",
  JPL_HORIZONS:"jpl-horizons",
  SPICE_SPK:"spice-spk",
  TWO_BODY:"two-body-kepler",
  TLE:"tle",
  STATIC:"static"
});

export function normalizeSolarEntity(raw){
  if(!raw?.entity_id) throw new TypeError("entity_id required");
  if(!raw?.kind) throw new TypeError("kind required");
  if(!SOLAR_ENTITY_KINDS.includes(raw.kind)) throw new RangeError(`unsupported solar entity kind: ${raw.kind}`);
  if(!raw?.name) throw new TypeError("name required");
  const sources=[...new Set(Array.isArray(raw.sources)?raw.sources.filter(Boolean):[])];
  const origin_status=raw.origin_status??"unknown";
  if(!ORIGIN_STATUS.includes(origin_status)) throw new RangeError(`unsupported origin status: ${origin_status}`);
  const uniq=v=>[...new Set(Array.isArray(v)?v.filter(Boolean):[])];
  const claims=(raw.claims??[]).map(c=>Object.freeze({claim:String(c.claim),status:c.status??"candidate",confidence:c.confidence??null,source:c.source??null,note:c.note??null}));
  return Object.freeze({
    entity_id:String(raw.entity_id),
    name:String(raw.name),
    kind:raw.kind,
    designation:raw.designation??null,
    parent_id:raw.parent_id??"sun",
    population:raw.population??null,
    status:raw.status??"catalogued",
    origin_status,
    orbit_facets:Object.freeze(uniq(raw.orbit_facets)),
    physical_facets:Object.freeze(uniq(raw.physical_facets)),
    claims:Object.freeze(claims),
    propagation_authority:raw.propagation_authority??null,
    source_record_id:raw.source_record_id??null,
    epoch:raw.epoch??null,
    uncertainty:raw.uncertainty??null,
    sources,
    metadata:Object.freeze({...raw.metadata})
  });
}

export function choosePropagationAuthority(entity){
  const e=normalizeSolarEntity(entity);
  if(e.propagation_authority) return e.propagation_authority;
  if(e.kind==="spacecraft") return PROPAGATION_AUTHORITIES.JPL_HORIZONS;
  if(e.kind==="artificial-satellite") return PROPAGATION_AUTHORITIES.TLE;
  if(["asteroid","centaur","tno","comet"].includes(e.kind))
    return PROPAGATION_AUTHORITIES.MPC_ELEMENTS;
  if(e.kind==="interstellar-object") return null;
  return PROPAGATION_AUTHORITIES.JPL_HORIZONS;
}

export function buildSolarEntityIndex(records){
  const map=new Map();
  for(const raw of records){
    const e=normalizeSolarEntity(raw);
    if(map.has(e.entity_id)) throw new Error(`duplicate solar entity_id: ${e.entity_id}`);
    map.set(e.entity_id,e);
  }
  return map;
}

export function mergeSolarEntityEvidence(base,patch){
  const a=normalizeSolarEntity(base);
  if(patch.entity_id && String(patch.entity_id)!==a.entity_id) throw new Error("entity_id is immutable");
  return normalizeSolarEntity({
    ...a,...patch,entity_id:a.entity_id,
    metadata:{...a.metadata,...patch.metadata},
    orbit_facets:[...a.orbit_facets,...(patch.orbit_facets??[])],
    physical_facets:[...a.physical_facets,...(patch.physical_facets??[])],
    claims:[...a.claims,...(patch.claims??[])],
    sources:[...a.sources,...(patch.sources??[])].filter((v,i,x)=>x.indexOf(v)===i)
  });
}
