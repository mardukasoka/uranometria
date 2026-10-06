// Uranometria small-body LOD0 adapter v0.1
// Identity/catalogue layer only. Orbital snapshots are injected separately.

import { orbitalPositionAu, propagateTwoBody, populationChunk } from "./small-body-orbits.js";

export const LOD0_OBJECTS = Object.freeze([
  // Comet taxonomy anchors: dynamical family and solar-encounter behaviour are independent facets.
  {id:"comet:2P",designation:"2P",name:"Encke",population:"Encke-type comet",orbitFacets:["sunskirter"],metadata:{cometClass:"ETc"}},
  {id:"comet:55P",designation:"55P",name:"Tempel–Tuttle",population:"Halley-type comet",metadata:{cometClass:"HTC"}},
  {id:"comet:109P",designation:"109P",name:"Swift–Tuttle",population:"Halley-type comet",metadata:{cometClass:"HTC"}},
  {id:"comet:8P",designation:"8P",name:"Tuttle",population:"Halley-type comet",metadata:{cometClass:"HTC"}},
  {id:"comet:46P",designation:"46P",name:"Wirtanen",population:"Jupiter-family comet",metadata:{cometClass:"JFC"}},
  {id:"comet:73P",designation:"73P",name:"Schwassmann–Wachmann 3",population:"Jupiter-family comet",metadata:{cometClass:"JFC",phenomenon:"fragmenting"}},
  {id:"comet:41P",designation:"41P",name:"Tuttle–Giacobini–Kresák",population:"Jupiter-family comet",metadata:{cometClass:"JFC"}},
  {id:"comet:C1995O1",designation:"C/1995 O1",name:"Hale–Bopp",population:"long-period comet",metadata:{reservoir:"Oort cloud"}},
  {id:"comet:C1996B2",designation:"C/1996 B2",name:"Hyakutake",population:"long-period comet",metadata:{reservoir:"Oort cloud"}},
  {id:"comet:C2020F3",designation:"C/2020 F3",name:"NEOWISE",population:"long-period comet",metadata:{reservoir:"Oort cloud"}},
  {id:"comet:C2012S1",designation:"C/2012 S1",name:"ISON",population:"long-period comet",orbitFacets:["sun-grazing","sundiver"],metadata:{group:"unaffiliated sungrazer",fate:"disrupted near perihelion"}},
  {id:"comet:C2011W3",designation:"C/2011 W3",name:"Lovejoy",population:"Kreutz group comet",orbitFacets:["sun-grazing"],metadata:{group:"Kreutz",fate:"survived perihelion initially"}},
  {id:"comet:C1965S1",designation:"C/1965 S1",name:"Ikeya–Seki",population:"Kreutz group comet",orbitFacets:["sun-grazing"],metadata:{group:"Kreutz"}},
  {id:"comet:C1843D1",designation:"C/1843 D1",name:"Great March Comet",population:"Kreutz group comet",orbitFacets:["sun-grazing"],metadata:{group:"Kreutz"}},
  {id:"comet:96P",designation:"96P",name:"Machholz 1",population:"near-Sun comet",orbitFacets:["sunskirter"],metadata:{complex:"Machholz complex"}},
  // Spacecraft-encountered small bodies: high-information observational anchors.
  {id:"mpc:253",designation:"253",name:"Mathilde",population:"Main Belt",physicalFacets:["spacecraft-visited"],metadata:{missions:["NEAR Shoemaker"],encounters:["flyby"]}},
  {id:"mpc:243",designation:"243",name:"Ida",population:"Main Belt",physicalFacets:["spacecraft-visited"],metadata:{missions:["Galileo"],encounters:["flyby"],satellites:["Dactyl"]}},
  {id:"mpc:9969",designation:"9969",name:"Braille",population:"Main Belt",physicalFacets:["spacecraft-visited"],metadata:{missions:["Deep Space 1"],encounters:["flyby"]}},
  {id:"mpc:25143",designation:"25143",name:"Itokawa",population:"NEO",physicalFacets:["spacecraft-visited","sample-return"],metadata:{missions:["Hayabusa"],encounters:["rendezvous","sample-return"],imageEvidence:{preferred:"mission-resolved",agency:"JAXA",lazy:true}}},
  {id:"mpc:162173",designation:"162173",name:"Ryugu",population:"Apollo",physicalFacets:["spacecraft-visited","sample-return"],metadata:{missions:["Hayabusa2"],encounters:["rendezvous","sample-return"],imageEvidence:{preferred:"mission-resolved",agency:"JAXA",lazy:true}}},
  {id:"mpc:101955",designation:"101955",name:"Bennu",population:"Apollo",physicalFacets:["spacecraft-visited","sample-return"],metadata:{missions:["OSIRIS-REx"],encounters:["rendezvous","sample-return"],imageEvidence:{preferred:"mission-resolved",agency:"NASA",lazy:true}}},
  {id:"mpc:65803",designation:"65803",name:"Didymos",population:"Apollo",physicalFacets:["spacecraft-visited"],metadata:{missions:["DART","Hera"],encounters:["impact-system","orbiter-system"],satellites:["Dimorphos"]}},
  {id:"mpc:152830",designation:"152830",name:"Dinkinesh",population:"Main Belt",physicalFacets:["spacecraft-visited"],metadata:{missions:["Lucy"],encounters:["flyby"],satellites:["Selam"],imageEvidence:{preferred:"mission-resolved",agency:"NASA",lazy:true}}},
  {id:"mpc:2867",designation:"2867",name:"Šteins",population:"Main Belt",physicalFacets:["spacecraft-visited"],metadata:{missions:["Rosetta"],encounters:["flyby"]}},
  {id:"mpc:21",designation:"21",name:"Lutetia",population:"Main Belt",physicalFacets:["spacecraft-visited"],metadata:{missions:["Rosetta"],encounters:["flyby"]}},
  {id:"mpc:5535",designation:"5535",name:"Annefrank",population:"Main Belt",physicalFacets:["spacecraft-visited"],metadata:{missions:["Stardust"],encounters:["flyby"]}},
  {id:"comet:21P",designation:"21P",name:"Giacobini–Zinner",population:"comet",physicalFacets:["spacecraft-visited"],metadata:{missions:["ICE"],encounters:["tail/coma flythrough"]}},
  {id:"comet:1P",designation:"1P",name:"Halley",population:"comet",physicalFacets:["spacecraft-visited"],metadata:{missions:["Vega 1","Vega 2","Giotto","Suisei","Sakigake"],encounters:["flyby"]}},
  {id:"comet:19P",designation:"19P",name:"Borrelly",population:"comet",physicalFacets:["spacecraft-visited"],metadata:{missions:["Deep Space 1"],encounters:["flyby"]}},
  {id:"comet:81P",designation:"81P",name:"Wild 2",population:"comet",physicalFacets:["spacecraft-visited","sample-return"],metadata:{missions:["Stardust"],encounters:["flyby","coma sample-return"],imageEvidence:{preferred:"mission-resolved",agency:"NASA",lazy:true}}},
  {id:"comet:9P",designation:"9P",name:"Tempel 1",population:"comet",physicalFacets:["spacecraft-visited"],metadata:{missions:["Deep Impact","Stardust-NExT"],encounters:["impact/flyby","revisit flyby"]}},
  {id:"comet:103P",designation:"103P",name:"Hartley 2",population:"comet",physicalFacets:["spacecraft-visited"],metadata:{missions:["EPOXI"],encounters:["flyby"]}},
  {id:"comet:67P",designation:"67P",name:"Churyumov–Gerasimenko",population:"comet",physicalFacets:["spacecraft-visited"],metadata:{missions:["Rosetta","Philae"],encounters:["orbiter","landing"],imageEvidence:{preferred:"mission-resolved",agency:"ESA",lazy:true}}},
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
  // Named outer-system systems: identity-first catalogue. Orbital states remain separately gated.
  {id:"mpc:225088",designation:"225088",name:"Gonggong",population:"TNO",physicalFacets:["binary"],metadata:{satellites:["Xiangliu"]}},
  {id:"mpc:50000",designation:"50000",name:"Quaoar",population:"TNO",physicalFacets:["binary","ringed"],claims:[{claim:"two reported rings",status:"confirmed"}],metadata:{satellites:["Weywot"]}},
  {id:"mpc:90482",designation:"90482",name:"Orcus",population:"resonant TNO",physicalFacets:["binary"],metadata:{satellites:["Vanth"]}},
  {id:"mpc:120347",designation:"120347",name:"Salacia",population:"TNO",physicalFacets:["binary"],metadata:{satellites:["Actaea"]}},
  {id:"mpc:174567",designation:"174567",name:"Varda",population:"TNO",physicalFacets:["binary"],metadata:{satellites:["Ilmarë"]}},
  {id:"mpc:28978",designation:"28978",name:"Ixion",population:"resonant TNO"},
  {id:"mpc:20000",designation:"20000",name:"Varuna",population:"TNO",physicalFacets:["fast-rotator"]},
  {id:"mpc:19521",designation:"19521",name:"Chaos",population:"classical TNO"},
  {id:"mpc:38628",designation:"38628",name:"Huya",population:"resonant TNO",physicalFacets:["binary"]},
  {id:"mpc:229762",designation:"229762",name:"Gǃkúnǁʼhòmdímà",population:"TNO",physicalFacets:["binary"],metadata:{satellites:["Gǃòʼé ǃHú"]}},
  {id:"mpc:15760",designation:"15760",name:"Albion",population:"classical TNO"},
  {id:"mpc:486958",designation:"486958",name:"Arrokoth",population:"classical TNO",physicalFacets:["contact-binary","spacecraft-visited"],metadata:{missions:["New Horizons"],encounters:["flyby"],imageEvidence:{preferred:"mission-resolved",agency:"NASA",lazy:true}}},
  {id:"mpc:47171",designation:"47171",name:"Lempo",population:"resonant TNO",resonance:"3:2 with Neptune",physicalFacets:["triple"],metadata:{satellites:["Hiisi","Paha"],system:"hierarchical triple"}}

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
