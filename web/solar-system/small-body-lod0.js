// Uranometria small-body LOD0 adapter v0.1
// Identity/catalogue layer only. Orbital snapshots are injected separately.

import { orbitalPositionAu, propagateTwoBody, populationChunk } from "./small-body-orbits.js";

export const LOD0_OBJECTS = Object.freeze([
  {id:"mpc:99942",designation:"99942",name:"Apophis",population:"Apollo"},
  {id:"mpc:433",designation:"433",name:"Eros",population:"Amor"},
  {id:"mpc:3200",designation:"3200",name:"Phaethon",population:"Apollo"},

  // Extreme inner-Solar-System validators. Do not conflate perihelion inside Mercury with an orbit wholly inside Mercury.
  {id:"mpc:2021PH27",designation:"2021 PH27",name:"2021 PH27",population:"Atira",dynamicalClass:"extreme-perihelion",orbitFacets:["perihelion-inside-mercury"]},
  {id:"mpc:2020AV2",designation:"2020 AV2",name:"2020 AV2",population:"Vatira",dynamicalClass:"venus-interior"},
  {id:"comet:322P",designation:"322P",name:"322P/SOHO",population:"near-Sun comet",dynamicalClass:"sungrazer-transition",physicalFacets:["active-asteroid"],claims:[{claim:"comet-asteroid transition or extinct-comet-like nature",status:"candidate"}]},
  {id:"mpc:1",designation:"1",name:"Ceres",population:"Main Belt"},
  {id:"mpc:4",designation:"4",name:"Vesta",population:"Main Belt"},
  {id:"mpc:2",designation:"2",name:"Pallas",population:"Main Belt"},
  {id:"mpc:588",designation:"588",name:"Achilles",population:"Jupiter Trojan"},
  {id:"mpc:2060",designation:"2060",name:"Chiron",population:"Centaur",physicalFacets:["ringed"],claims:[{claim:"evolving ring/disk system",status:"observationally-supported"}]},
  {id:"mpc:5145",designation:"5145",name:"Pholus",population:"Centaur"},
  {id:"mpc:10199",designation:"10199",name:"Chariklo",population:"Centaur",physicalFacets:["ringed"]},
  {id:"mpc:134340",designation:"134340",name:"Pluto",population:"TNO"},
  {id:"mpc:136199",designation:"136199",name:"Eris",population:"detached TNO"},
  {id:"mpc:136108",designation:"136108",name:"Haumea",population:"TNO",physicalFacets:["ringed"]},
  {id:"mpc:136472",designation:"136472",name:"Makemake",population:"TNO"},
  {id:"mpc:50000",designation:"50000",name:"Quaoar",population:"TNO",physicalFacets:["ringed"],claims:[{claim:"two reported rings",status:"confirmed"}]},
  {id:"mpc:90377",designation:"90377",name:"Sedna",population:"detached TNO",dynamicalClass:"sednoid"},
  {id:"mpc:2018VG18",designation:"2018 VG18",name:"Farout",population:"TNO"},
  {id:"mpc:2018AG37",designation:"2018 AG37",name:"Farfarout",population:"TNO"},
  {id:"mpc:541132",designation:"541132",name:"Leleākūhonua",population:"detached TNO",dynamicalClass:"sednoid",provisionalDesignation:"2015 TG387"},

  // Earth co-orbital validation group. Resonant state is not the MPC orbit class.
  {id:"mpc:3753",designation:"3753",name:"Cruithne",population:"Earth co-orbital",resonance:"horseshoe/compound"},
  {id:"mpc:2002AA29",designation:"2002 AA29",name:"2002 AA29",population:"Earth co-orbital",resonance:"horseshoe/quasi-satellite transition"},
  {id:"mpc:85770",designation:"85770",name:"1998 UP1",population:"Earth co-orbital",mpcClass:"Aten",resonance:"near-1:1"},
  {id:"mpc:469219",designation:"469219",name:"Kamoʻoalewa",population:"Earth co-orbital",resonance:"quasi-satellite"},
  {id:"mpc:2010TK7",designation:"2010 TK7",name:"2010 TK7",population:"Earth co-orbital",resonance:"L4 Trojan"},
  {id:"mpc:614689",designation:"614689",name:"2020 XL5",population:"Earth co-orbital",resonance:"L4 Trojan"}
]);

export function indexSnapshots(records=[]) {
  const map=new Map();
  for (const r of records) {
    const key=String(r.entity_id ?? r.id ?? "");
    if (!key) throw new TypeError("orbital snapshot missing entity_id");
    if (map.has(key)) throw new Error(`duplicate orbital snapshot: ${key}`);
    map.set(key,r);
  }
  return map;
}

export function buildLod0RenderSet(snapshots,targetEpochMjdTt,{chunk=null}={}) {
  const byId=indexSnapshots(snapshots);
  const rendered=[], missing=[];
  for (const object of LOD0_OBJECTS) {
    const objectChunk=populationChunk(object.population);
    if (chunk && objectChunk!==chunk) continue;
    const state=byId.get(object.id);
    if (!state) { missing.push({...object,reason:"no-validated-orbital-snapshot"}); continue; }
    const propagated=propagateTwoBody(state,targetEpochMjdTt);
    rendered.push({
      ...object,
      chunk:objectChunk,
      source_epoch_mjd_tt:propagated.source_epoch_mjd_tt,
      render_epoch_mjd_tt:propagated.epoch_mjd_tt,
      position_au:orbitalPositionAu(propagated),
      propagation_model:propagated.propagation_model,
      propagation_precision:propagated.propagation_precision,
      provenance:state.provenance ?? null
    });
  }
  return {rendered,missing,target_epoch_mjd_tt:Number(targetEpochMjdTt)};
}
