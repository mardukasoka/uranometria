// Galactic compact-object coordinate and scale adapter.
// Catalogues are imported separately; no synthetic sources are inserted.
// Convention: heliocentric Galactic Cartesian coordinates, +X toward l=0,
// +Y toward l=90°, +Z toward Galactic north. Units: parsecs.
export const PC_IN_KM = 3.085677581491367e13;
export const SOLAR_MASS_KG = 1.98847e30;
export const G_SI = 6.67430e-11;
export const C_SI = 299792458;
export function galacticXYZ(longitudeDeg, latitudeDeg, distancePc) {
  if (![longitudeDeg,latitudeDeg,distancePc].every(Number.isFinite) || distancePc < 0)
    throw new RangeError('Valid Galactic longitude, latitude, and distance (pc) required');
  const l=longitudeDeg*Math.PI/180, b=latitudeDeg*Math.PI/180;
  return {x:distancePc*Math.cos(b)*Math.cos(l),
          y:distancePc*Math.cos(b)*Math.sin(l),
          z:distancePc*Math.sin(b)};
}
export function schwarzschildRadiusKm(massSolar) {
  if (!Number.isFinite(massSolar)||massSolar<=0) throw new RangeError('Mass must be positive');
  return 2*G_SI*massSolar*SOLAR_MASS_KG/(C_SI*C_SI)/1000;
}
export function kmToParsec(km) {return km/PC_IN_KM;}
export function makeCompactObject(record) {
  const {id,name,kind,galacticLongitudeDeg,galacticLatitudeDeg,distancePc,
    distanceLowPc=null,distanceHighPc=null,massSolar=null,radiusKm=null,
    references=[],classification='unverified',tags=[]}=record;
  if (!id||!name||!kind||!references.length) throw new Error('ID, name, kind and provenance required');
  const position=Number.isFinite(distancePc)
    ?galacticXYZ(galacticLongitudeDeg,galacticLatitudeDeg,distancePc):null;
  return {id,name,kind,tags,classification,position,
    distancePc,distanceLowPc,distanceHighPc,massSolar,radiusKm,references,
    horizonRadiusKm:kind==='black-hole'&&Number.isFinite(massSolar)
      ?schwarzschildRadiusKm(massSolar):null,
    // Physical radius is not used as the marker size at Galactic zoom.
    markerIsNotToScale:true};
}
export function filterMilkyWay(records) {
  return records.filter(r=>r.hostGalaxy==='Milky Way' && Number.isFinite(r.distancePc));
}
// Rendering contract: galaxy marker size is screen-space only.
// At local-system zoom convert physical km to scene parsecs via kmToParsec.
// Black-hole Schwarzschild radius is a nonrotating reference, not Kerr horizon.
// Unknown distances must NOT be assigned invented XYZ positions.
