// Convert one raw MPC mpc_orb record into Uranometria's normalized snapshot.
// This module performs no network I/O so builds remain reproducible/offline.

export function zipCoefficients(block) {
  if (!block?.coefficient_names || !block?.coefficient_values) throw new TypeError("missing MPC coefficient block");
  return Object.fromEntries(block.coefficient_names.map((n,i)=>[n,Number(block.coefficient_values[i])]));
}

export function normalizeMpcOrb(entityId, raw, provenance={}) {
  if (!raw?.COM || !raw?.CAR || !raw?.epoch_data) throw new TypeError("incomplete mpc_orb record");
  const com=zipCoefficients(raw.COM);
  const car=zipCoefficients(raw.CAR);
  const q=Number(com.q);
  const e=Number(com.e);
  const a=Number.isFinite(Number(com.a)) ? Number(com.a) : q/(1-e);

  const pick=(...names)=>{
    for(const n of names) if(Number.isFinite(Number(com[n]))) return Number(com[n]);
    return NaN;
  };

  const snapshot={
    entity_id:entityId,
    source:"Minor Planet Center",
    epoch_mjd_tt:Number(raw.epoch_data.epoch),
    semimajor_axis_au:a,
    eccentricity:e,
    inclination_deg:pick("i","incl"),
    ascending_node_deg:pick("node","Omega"),
    argument_perihelion_deg:pick("argperi","omega","peri"),
    mean_anomaly_deg:pick("meananomaly","M"),
    source_orbit_class:raw.orbit_class ?? raw.classification ?? null,
    mpc_cartesian:{
      x:car.x,y:car.y,z:car.z,
      vx:car.vx ?? car.xdot,vy:car.vy ?? car.ydot,vz:car.vz ?? car.zdot
    },
    system_data:raw.system_data ?? null,\n    provenance:{...provenance,authority:"MPC",designation_data:raw.designation_data ?? null}
  };
  for(const k of ["epoch_mjd_tt","semimajor_axis_au","eccentricity","inclination_deg","ascending_node_deg","argument_perihelion_deg","mean_anomaly_deg"]) {
    if(!Number.isFinite(snapshot[k])) throw new TypeError(`invalid normalized MPC field: ${k}`);
  }
  for(const k of ["x","y","z","vx","vy","vz"]) {\n    if(!Number.isFinite(Number(snapshot.mpc_cartesian[k]))) throw new TypeError(`invalid MPC Cartesian field: ${k}`);\n  }\n  return snapshot;
}

export function cartesianResidualAu(calculated,mpcCartesian) {
  return Math.hypot(calculated.x-mpcCartesian.x,calculated.y-mpcCartesian.y,calculated.z-mpcCartesian.z);
}
