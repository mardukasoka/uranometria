// Uranometria best-available-position policy.
// Identity confidence and positional confidence are intentionally independent.
// Preferred source order follows authoritative ephemeris/state first, then osculating elements.

export const POSITION_TIERS=Object.freeze([
  "ephemeris-state",       // Horizons/SPICE/MPC Cartesian state at/near requested epoch
  "osculating-propagated", // published MPC/JPL osculating elements propagated to view epoch
  "catalogue-epoch",       // published state/elements at source epoch, shown at that epoch
  "identity-only"          // known object, no defensible render position
]);

export function chooseBestPosition({ephemeris=null,propagated=null,catalogueEpoch=null}={}){
  if(ephemeris) return Object.freeze({tier:"ephemeris-state",...ephemeris});
  if(propagated) return Object.freeze({tier:"osculating-propagated",...propagated});
  if(catalogueEpoch) return Object.freeze({tier:"catalogue-epoch",...catalogueEpoch});
  return Object.freeze({tier:"identity-only",renderable:false,reason:"no-defensible-position"});
}

export function positionBadge(position){
  if(!position) return "NO POSITION";
  return ({
    "ephemeris-state":"EPHEMERIS",
    "osculating-propagated":"PROPAGATED",
    "catalogue-epoch":"SOURCE EPOCH",
    "identity-only":"NO POSITION"
  })[position.tier]??"UNKNOWN";
}
