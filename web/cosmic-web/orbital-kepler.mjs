// Lightweight heliocentric Keplerian helpers adapted for Uranometria.
// Coordinates: AU, J2000 ecliptic. Angles: degrees in data, radians internally.
const TAU=Math.PI*2;
export const LIGHT_DAY_AU=299792458*86400/149597870700;
export function deg(v){return v*Math.PI/180}
export function solveKepler(M,e){M=((M%TAU)+TAU)%TAU;let E=e<.8?M:Math.PI;for(let k=0;k<12;k++){const d=(E-e*Math.sin(E)-M)/(1-e*Math.cos(E));E-=d;if(Math.abs(d)<1e-11)break}return E}
export function positionFromElements(o,jd=o.epoch_jd){const n=0.01720209895/Math.pow(o.a_au,1.5);const M=deg(o.M_deg)+n*(jd-o.epoch_jd);const E=solveKepler(M,o.e),x0=o.a_au*(Math.cos(E)-o.e),y0=o.a_au*Math.sqrt(1-o.e*o.e)*Math.sin(E);const O=deg(o.node_deg),w=deg(o.argp_deg),i=deg(o.i_deg),cw=Math.cos(w),sw=Math.sin(w),cO=Math.cos(O),sO=Math.sin(O),ci=Math.cos(i),si=Math.sin(i);return[(cO*cw-sO*sw*ci)*x0+(-cO*sw-sO*cw*ci)*y0,(sO*cw+cO*sw*ci)*x0+(-sO*sw+cO*cw*ci)*y0,(sw*si)*x0+(cw*si)*y0]}
export function sampleOrbit(o,steps=160){const out=[];for(let k=0;k<=steps;k++){const E=TAU*k/steps,x0=o.a_au*(Math.cos(E)-o.e),y0=o.a_au*Math.sqrt(1-o.e*o.e)*Math.sin(E),O=deg(o.node_deg),w=deg(o.argp_deg),i=deg(o.i_deg),cw=Math.cos(w),sw=Math.sin(w),cO=Math.cos(O),sO=Math.sin(O),ci=Math.cos(i),si=Math.sin(i);out.push([(cO*cw-sO*sw*ci)*x0+(-cO*sw-sO*cw*ci)*y0,(sO*cw+cO*sw*ci)*x0+(-sO*sw+cO*cw*ci)*y0,(sw*si)*x0+(cw*si)*y0])}return out}
