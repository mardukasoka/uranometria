import { LOD0_OBJECTS,indexSnapshots,buildLod0RenderSet } from "./small-body-lod0.js";

const assert=(ok,msg)=>{if(!ok)throw new Error(msg);};
assert(LOD0_OBJECTS.some(o=>o.name==="2002 AA29"),"AA29 present");
assert(LOD0_OBJECTS.some(o=>o.name==="1998 UP1"),"UP1 present");
assert(LOD0_OBJECTS.filter(o=>o.population==="Centaur").length===3,"three Centaur validators");

const empty=buildLod0RenderSet([],60010);
assert(empty.rendered.length===0,"no invented positions");
assert(empty.missing.length===LOD0_OBJECTS.length,"missing snapshots reported");

const chiron={entity_id:"mpc:2060",epoch_mjd_tt:60000,semimajor_axis_au:13.7,
 eccentricity:0.38,inclination_deg:6.9,ascending_node_deg:209,
 argument_perihelion_deg:339,mean_anomaly_deg:10,provenance:{source:"test-fixture"}};
const outer=buildLod0RenderSet([chiron],60001,{chunk:"outer"});
assert(outer.rendered.length===1&&outer.rendered[0].name==="Chiron","validated Centaur renders");
assert(outer.rendered[0].chunk==="outer","Centaur outer chunk");
assert(outer.missing.some(o=>o.name==="Pholus"),"missing Centaur remains explicit");
assert(outer.rendered[0].provenance.source==="test-fixture","provenance preserved");

let duplicateRejected=false;
try{indexSnapshots([chiron,chiron]);}catch{duplicateRejected=true;}
assert(duplicateRejected,"duplicate state rejected");

console.log("small-body-lod0: PASS");
