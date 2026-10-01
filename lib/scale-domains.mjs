// Shared scale-domain metadata for Uranometria.
// Domain changes may change origin, native units and renderer, but never the user's
// selected display orientation. Scientific catalogue coordinates remain immutable.

export const SCALE_DOMAINS = Object.freeze([
  {id:"solar-system", origin:"solar-system-barycentre", nativeFrame:"icrs", units:"au"},
  {id:"stellar-neighbourhood", origin:"solar-system-barycentre", nativeFrame:"icrs", units:"pc"},
  {id:"milky-way", origin:"galactic-centre", nativeFrame:"galactocentric", units:"kpc"},
  {id:"local-group", origin:"local-group-barycentre", nativeFrame:"icrs", units:"kpc"},
  {id:"local-universe", origin:"milky-way-observer", nativeFrame:"supergalactic", units:"Mpc/h"},
  {id:"cosmic-web", origin:"milky-way-observer", nativeFrame:"supergalactic", units:"Mpc/h"},
  {id:"deep-universe", origin:"observer", nativeFrame:"equatorial", units:"redshift"}
]);

export function getScaleDomain(id){
  const d=SCALE_DOMAINS.find(x=>x.id===id);
  if(!d) throw new Error(`unknown scale domain: ${id}`);
  return d;
}

// Display orientation is global UI state. Crossing a scale boundary must preserve it.
export function transitionScaleDomain(state,nextDomainId){
  const next=getScaleDomain(nextDomainId);
  return {
    ...state,
    domain:next.id,
    origin:next.origin,
    nativeFrame:next.nativeFrame,
    units:next.units,
    displayFrame:state.displayFrame
  };
}

export function assertOrientationInvariant(before,after){
  if(before.displayFrame!==after.displayFrame) throw new Error(
    `scale transition rotated display frame: ${before.displayFrame} -> ${after.displayFrame}`
  );
  return after;
}
