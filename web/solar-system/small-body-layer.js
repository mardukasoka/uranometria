// Renderer-neutral bridge from validated LOD0 records to Uranometria's existing Solar-System viewer.
// No DOM, canvas, Three.js or camera ownership.

import {buildLod0RenderSet,LOD0_OBJECTS} from "./small-body-lod0.js";
import {sampleOrbitAu,populationChunk} from "./small-body-orbits.js";

export function createSmallBodyLayer({snapshots=[],epochMjdTt,onChange=()=>{}}={}) {
  let state={snapshots:[...snapshots],epochMjdTt:Number(epochMjdTt),chunk:null,selectedId:null,showOrbits:false};

  const build=()=>{
    const set=buildLod0RenderSet(state.snapshots,state.epochMjdTt,{chunk:state.chunk});
    const selected=set.rendered.find(x=>x.id===state.selectedId)||null;
    const selectedSnapshot=state.snapshots.find(x=>(x.entity_id??x.id)===state.selectedId)||null;
    return {
      ...set,
      selected,
      selectedOrbitAu:selected&&selectedSnapshot&&state.showOrbits ? sampleOrbitAu(selectedSnapshot,128) : null,
      filter:state.chunk,
      counts:{
        catalogue:LOD0_OBJECTS.filter(o=>!state.chunk||populationChunk(o.population)===state.chunk).length,
        rendered:set.rendered.length,
        missing:set.missing.length
      }
    };
  };
  const emit=()=>{const view=build();onChange(view);return view;};

  return {
    getView:build,
    setEpoch(epoch){state.epochMjdTt=Number(epoch);return emit();},
    setPopulationChunk(chunk){state.chunk=chunk||null;return emit();},
    select(id){state.selectedId=id||null;return emit();},
    setSelectedOrbitVisible(value){state.showOrbits=!!value;return emit();},
    replaceSnapshots(records){state.snapshots=[...records];return emit();}
  };
}
