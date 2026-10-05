// Uranometria small-body orbital utilities v0.1
// Pure module: no DOM/Three.js dependency. Angles are degrees at the data boundary.

export const MPC_ORBIT_TYPES = Object.freeze({
  0:"Atira",1:"Aten",2:"Apollo",3:"Amor",9:"Inner other",
  10:"Mars Crosser",11:"Main Belt",12:"Jupiter Trojan",19:"Middle other",
  20:"Jupiter Coupled",21:"Neptune Trojan",22:"Centaur",23:"TNO",
  30:"Hyperbolic",31:"Parabolic",40:"Long Period Comet",
  41:"Short Period Comet",50:"Natural Satellite",99:"Other"
});

const DEG = Math.PI / 180;
const TAU = Math.PI * 2;

export function wrapRadians(x) {
  x %= TAU;
  return x < 0 ? x + TAU : x;
}

export function classifyMpcElements({a,e,q,Q,tisserandJupiter}) {
  // Mirrors the public MPC element-cut taxonomy where enough fields exist.
  if (e > 1) return 30;
  if (e === 1) return 31;
  if (a < 1 && Q < 0.983) return 0;
  if (a < 1 && Q >= 0.983) return 1;
  if (a >= 1 && q < 1.017) return 2;
  if (a >= 1 && q >= 1.017 && q < 1.3) return 3;
  if (a >= 1 && a < 3.2 && q > 1.3 && q < 1.666) return 10;
  if (a >= 1 && a < 3.27831) return 11;
  if (a > 4.8 && a < 5.4 && e < 0.3) return 12;
  if (a >= 1 && tisserandJupiter > 2 && tisserandJupiter < 3) return 20;
  if (a > 29.8 && a < 30.4) return 21;
  if (a >= 5.204 && a < 30.178) return 22;
  if (a >= 30.178) return 23;
  return 99;
}

export function solveEccentricAnomaly(meanAnomalyRad, eccentricity, iterations=12) {
  if (!(eccentricity >= 0 && eccentricity < 1)) {
    throw new RangeError("v0.1 renderer supports bound elliptical orbits only");
  }
  const M = wrapRadians(meanAnomalyRad);
  let E = eccentricity < 0.8 ? M : Math.PI;
  for (let n=0;n<iterations;n++) {
    const f = E - eccentricity*Math.sin(E) - M;
    E -= f / (1 - eccentricity*Math.cos(E));
  }
  return E;
}

export function orbitalPositionAu(elements, meanAnomalyDeg=elements.mean_anomaly_deg) {
  const a = Number(elements.semimajor_axis_au);
  const e = Number(elements.eccentricity);
  const inc = Number(elements.inclination_deg) * DEG;
  const node = Number(elements.ascending_node_deg) * DEG;
  const arg = Number(elements.argument_perihelion_deg) * DEG;
  const E = solveEccentricAnomaly(Number(meanAnomalyDeg) * DEG, e);

  // Orbital-plane coordinates, focus at Sun.
  const x0 = a * (Math.cos(E) - e);
  const y0 = a * Math.sqrt(1-e*e) * Math.sin(E);

  const cw=Math.cos(arg), sw=Math.sin(arg);
  const cO=Math.cos(node), sO=Math.sin(node);
  const ci=Math.cos(inc), si=Math.sin(inc);

  // Rz(Omega) Rx(i) Rz(omega)
  return {
    x: (cO*cw-sO*sw*ci)*x0 + (-cO*sw-sO*cw*ci)*y0,
    y: (sO*cw+cO*sw*ci)*x0 + (-sO*sw+cO*cw*ci)*y0,
    z: (sw*si)*x0 + (cw*si)*y0
  };
}

export function sampleOrbitAu(elements, segments=128) {
  const points = new Array(segments+1);
  for (let k=0;k<=segments;k++) {
    points[k] = orbitalPositionAu(elements, 360*k/segments);
  }
  return points;
}

export function perihelionAphelionAu({semimajor_axis_au:a,eccentricity:e}) {
  a=Number(a); e=Number(e);
  return {q:a*(1-e), Q:a*(1+e)};
}

export function populationChunk(population) {
  const p=String(population||"").toLowerCase();
  if (/atira|aten|apollo|amor|neo|co-orbital|quasi/.test(p)) return "inner";
  if (/mars|main belt|trojan|hilda|jupiter/.test(p)) return "middle";
  if (/centaur|neptune|tno|scattered|detached|classical|resonant/.test(p)) return "outer";
  return "special";
}
