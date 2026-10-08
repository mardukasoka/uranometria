// Mobile-first packing for normalized CF4 products.
// Keeps scientific coordinates in Mpc; reduces payload by deterministic selection/decimation.

export function distance3(p) { return Math.hypot(p[0], p[1], p[2]); }

export function selectGalaxies(objects, { maxPoints = 12000, radiusMpc = 300 } = {}) {
  const inside = objects.filter(o => Array.isArray(o.position) && distance3(o.position) <= radiusMpc);
  if (inside.length <= maxPoints) return inside;
  // Stable radial coverage: sort by radius then stride, avoiding random/non-reproducible sampling.
  inside.sort((a,b) => distance3(a.position) - distance3(b.position));
  const stride = inside.length / maxPoints, out = [];
  for (let i=0;i<maxPoints;i++) out.push(inside[Math.floor(i*stride)]);
  return out;
}

export function decimatePolyline(points, maxVertices = 96) {
  if (points.length <= maxVertices) return points;
  const out=[], stride=(points.length-1)/(maxVertices-1);
  for(let i=0;i<maxVertices;i++) out.push(points[Math.round(i*stride)]);
  return out;
}

export function selectStreamlines(objects, { maxLines = 1500, maxVertices = 96 } = {}) {
  if (!objects.length) return [];
  // Deterministic basin round-robin so one large basin does not monopolize the mobile payload.
  const basins = new Map();
  for (const s of objects) (basins.get(s.basin_id) ?? (basins.set(s.basin_id,[]),basins.get(s.basin_id))).push(s);
  const queues=[...basins.values()], out=[];
  let i=0;
  while(out.length<maxLines && queues.some(q=>q.length)){
    const q=queues[i++ % queues.length];
    if(q.length){ const s=q.shift(); out.push({...s,points:decimatePolyline(s.points,maxVertices)}); }
  }
  return out;
}

export function buildMobileManifest({ galaxies, streamlines }, options = {}) {
  const g=selectGalaxies(galaxies.objects,options.galaxies);
  const s=selectStreamlines(streamlines.objects,options.streamlines);
  return {
    version:"0.1.0",
    profile:"mobile-first",
    frame:galaxies.frame,
    epistemic:{galaxies:"catalogue + reconstructed basin membership",streamlines:"reconstruction"},
    counts:{galaxies:g.length,streamlines:s.length},
    galaxies:g,streamlines:s
  };
}
