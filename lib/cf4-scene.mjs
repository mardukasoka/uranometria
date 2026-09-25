// Browser-ready mobile CF4 scene model. Renderer-agnostic: Three.js/WebGL/WebGPU can consume this.
export function sceneFromMobile(pack) {
  if (!pack?.frame?.coordinates) throw new Error("CF4 mobile pack requires frame metadata");
  const points = pack.galaxies.map(g => ({
    id:g.id, position:g.position, basin_id:g.basin_id, distance_mpc:g.distance_mpc
  }));
  const lines = pack.streamlines.map(s => ({
    id:s.id, basin_id:s.basin_id, points:s.points
  }));
  return {
    version:"0.1.0",
    coordinateFrame:pack.frame,
    camera:{target:[0,0,0],near:0.1,far:2000},
    layers:[
      {id:"galaxies",type:"points",visible:true,count:points.length,data:points},
      {id:"streamlines",type:"polylines",visible:false,count:lines.length,data:lines}
    ],
    controls:{orbit:true,pan:true,pinchZoom:true,progressive:true},
    evidence:{galaxies:pack.epistemic.galaxies,streamlines:pack.epistemic.streamlines}
  };
}
