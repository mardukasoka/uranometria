// Lightweight heliocentric Keplerian helpers adapted for Uranometria.
// Coordinates: AU, J2000 ecliptic. Angles: degrees in data, radians internally.
const TAU=Math.PI*2;
const LIGHT_DAY_AU=299792458*86400/149597870700;
function deg(v){return v*Math.PI/180}
function solveKepler(M,e){M=((M%TAU)+TAU)%TAU;let E=e<.8?M:Math.PI;for(let k=0;k<12;k++){const d=(E-e*Math.sin(E)-M)/(1-e*Math.cos(E));E-=d;if(Math.abs(d)<1e-11)break}return E}
function positionFromElements(o,jd=o.epoch_jd){const n=0.01720209895/Math.pow(o.a_au,1.5);const M=deg(o.M_deg)+n*(jd-o.epoch_jd);const E=solveKepler(M,o.e),x0=o.a_au*(Math.cos(E)-o.e),y0=o.a_au*Math.sqrt(1-o.e*o.e)*Math.sin(E);const O=deg(o.node_deg),w=deg(o.argp_deg),i=deg(o.i_deg),cw=Math.cos(w),sw=Math.sin(w),cO=Math.cos(O),sO=Math.sin(O),ci=Math.cos(i),si=Math.sin(i);return[(cO*cw-sO*sw*ci)*x0+(-cO*sw-sO*cw*ci)*y0,(sO*cw+cO*sw*ci)*x0+(-sO*sw+cO*cw*ci)*y0,(sw*si)*x0+(cw*si)*y0]}
function sampleOrbit(o,steps=160){const out=[];for(let k=0;k<=steps;k++){const E=TAU*k/steps,x0=o.a_au*(Math.cos(E)-o.e),y0=o.a_au*Math.sqrt(1-o.e*o.e)*Math.sin(E),O=deg(o.node_deg),w=deg(o.argp_deg),i=deg(o.i_deg),cw=Math.cos(w),sw=Math.sin(w),cO=Math.cos(O),sO=Math.sin(O),ci=Math.cos(i),si=Math.sin(i);out.push([(cO*cw-sO*sw*ci)*x0+(-cO*sw-sO*cw*ci)*y0,(sO*cw+cO*sw*ci)*x0+(-sO*sw+cO*cw*ci)*y0,(sw*si)*x0+(cw*si)*y0])}return out}


const c=document.querySelector("#solar"),x=c.getContext("2d",{alpha:false});let data=null,yaw=.35,pitch=.42,zoom=1,drag=null,showOrbits=true,showLabels=true,viewMode="outer",sizeThresholdKm=0;
function rotateZ(p,a){const c=Math.cos(a),s=Math.sin(a);return[c*p[0]-s*p[1],s*p[0]+c*p[1],p[2]??0]}
function earthAtCoEpoch(){const e=data?.objects?.find(o=>o.id==="3"&&o.elements);return e?positionFromElements(e.elements,2400000.5+(data.earth_coorbitals?.common_epoch_mjd_tt??61200)):null}
function resize(){const d=Math.min(devicePixelRatio||1,2);c.width=innerWidth*d;c.height=innerHeight*d;x.setTransform(d,0,0,d,0,0)}addEventListener("resize",resize);resize();
function project(p){let[a,b,z]=p,cy=Math.cos(yaw),sy=Math.sin(yaw);[a,b]=[a*cy-b*sy,a*sy+b*cy];let cp=Math.cos(pitch),sp=Math.sin(pitch);[b,z]=[b*cp-z*sp,b*sp+z*cp];const base=(viewMode==="inner"||viewMode==="coorbitals")?Math.min(innerWidth,innerHeight)*.026:viewMode==="nearsun"?Math.min(innerWidth,innerHeight)*.22:Math.min(innerWidth,innerHeight)*.00125;const s=base*zoom;return[innerWidth/2+a*s,innerHeight/2-z*s]}
function bindControls(){
 const q=id=>document.getElementById(id);
 q("home")?.addEventListener("click",()=>{yaw=.35;pitch=.42;zoom=1});
 q("inner")?.addEventListener("click",()=>{viewMode="inner";zoom=1;q("status").textContent="Inner Solar System"});
 q("coorbitals")?.addEventListener("click",()=>{viewMode="coorbitals";zoom=1;q("status").textContent="Earth Co-orbitals"});
 q("nearsun")?.addEventListener("click",()=>{viewMode="nearsun";zoom=1;q("status").textContent="Near-Sun"});
 q("orbits")?.addEventListener("click",e=>{showOrbits=!showOrbits;e.currentTarget.classList.toggle("on",showOrbits)});
 q("labels")?.addEventListener("click",e=>{showLabels=!showLabels;e.currentTarget.classList.toggle("on",showLabels)});
}
bindControls();
function draw(){requestAnimationFrame(draw);x.fillStyle="#02040a";x.fillRect(0,0,innerWidth,innerHeight);if(!data)return;const markers=viewMode==="inner"?(data.inner_scale_markers??[]):viewMode==="coorbitals"?[1]:viewMode==="nearsun"?[0.307,0.387,0.718,0.983]:data.scale_markers;for(const r of markers){x.strokeStyle=r>170?"#89a9d62e":"#ffffff18";x.lineWidth=.7;x.beginPath();for(let k=0;k<=128;k++){const t=k/128*Math.PI*2,q=project([r*Math.cos(t),r*Math.sin(t),0]);k?x.lineTo(...q):x.moveTo(...q)}x.stroke();const q=project([r,0,0]);x.fillStyle="#aebbd0";x.font="9px system-ui";x.fillText(Math.abs(r-LIGHT_DAY_AU)<1?"1 light-day":Math.abs(r-2*LIGHT_DAY_AU)<2?"2 light-days":Math.round(r)+" AU",q[0]+3,q[1])}
const sun=project([0,0,0]);x.fillStyle="#fff";x.beginPath();x.arc(...sun,3,0,Math.PI*2);x.fill();if(showLabels){x.fillStyle="#fff";x.fillText("Sun",sun[0]+6,sun[1])}
if(viewMode==="coorbitals"){const ep=earthAtCoEpoch();if(ep){const a=-Math.atan2(ep[1],ep[0]);for(const r of data.earth_coorbitals?.records??[]){const q=project(rotateZ(r.position_au,a));x.fillStyle="#e5edff";x.beginPath();x.arc(...q,2.5,0,Math.PI*2);x.fill();if(showLabels){x.fillStyle="#d9e5ff";x.font="10px system-ui";x.fillText(r.label+" · "+r.class,q[0]+5,q[1])}}const eq=project(rotateZ(ep,a));x.fillStyle="#fff";x.beginPath();x.arc(...eq,3,0,Math.PI*2);x.fill();if(showLabels)x.fillText("Earth",eq[0]+5,eq[1])}}
for(const o of data.objects.filter(o=>o.elements && viewMode!=="coorbitals" && (viewMode!=="nearsun" || ["199","2021 PH27","2020 AV2","322P"].includes(o.id)) && (!sizeThresholdKm || (Number.isFinite(o.diameter_km) && o.diameter_km>=sizeThresholdKm && !["main-belt","main belt"].includes((o.population||"").toLowerCase())))) {if(showOrbits){x.strokeStyle="#8aa4c835";x.beginPath();sampleOrbit(o.elements,180).forEach((p,k)=>{const q=project(p);k?x.lineTo(...q):x.moveTo(...q)});x.stroke()}const p=project(positionFromElements(o.elements,o.elements.epoch_jd)),rad=o.kind==="planet"?2.6:2;x.fillStyle="#e5edff";x.beginPath();x.arc(...p,rad,0,Math.PI*2);x.fill();if(showLabels){x.fillStyle="#d9e5ff";x.font="10px system-ui";x.fillText(o.label,p[0]+5,p[1])}}

}
requestAnimationFrame(draw);
fetch("../data/solar-system/p0-outer-solar-system.json",{cache:"no-store"}).then(r=>r.json()).then(d=>{data=d;const ready=d.objects.filter(o=>o.elements).length;document.querySelector("#status").textContent=ready?ready+" epoch-stamped orbital solutions loaded":"Scale/provenance fixture loaded"}).catch(()=>document.querySelector("#status").textContent="Solar-System catalogue unavailable");
c.onpointerdown=e=>{drag=[e.clientX,e.clientY];c.setPointerCapture(e.pointerId)};c.onpointermove=e=>{if(!drag)return;yaw+=(e.clientX-drag[0])*.006;pitch=Math.max(-1.4,Math.min(1.4,pitch+(e.clientY-drag[1])*.006));drag=[e.clientX,e.clientY]};c.onpointerup=()=>drag=null;c.onwheel=e=>zoom=Math.max(.3,Math.min(12,zoom*Math.exp(-e.deltaY*.001)));let pinch=null;c.addEventListener("touchmove",e=>{if(e.touches.length===2){const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);if(pinch)zoom=Math.max(.3,Math.min(12,zoom*d/pinch));pinch=d}},{passive:true});c.addEventListener("touchend",()=>pinch=null);

