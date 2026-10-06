import {LIGHT_DAY_AU,positionFromElements,sampleOrbit} from "./orbital-kepler.mjs";
import {renderRecordToCanvasPoint} from "../solar-system/solar-canvas-adapter.js";
const c=document.querySelector("#solar"),x=c.getContext("2d",{alpha:false});let data=null,yaw=.35,pitch=.42,zoom=1,drag=null,showOrbits=true,showLabels=true;
function resize(){const d=Math.min(devicePixelRatio||1,2);c.width=innerWidth*d;c.height=innerHeight*d;x.setTransform(d,0,0,d,0,0)}addEventListener("resize",resize);resize();
function project(p){let[a,b,z]=p,cy=Math.cos(yaw),sy=Math.sin(yaw);[a,b]=[a*cy-b*sy,a*sy+b*cy];let cp=Math.cos(pitch),sp=Math.sin(pitch);[b,z]=[b*cp-z*sp,b*sp+z*cp];const s=Math.min(innerWidth,innerHeight)*.00125*zoom;return[innerWidth/2+a*s,innerHeight/2-z*s]}
function draw(){requestAnimationFrame(draw);x.fillStyle="#02040a";x.fillRect(0,0,innerWidth,innerHeight);if(!data)return;for(const r of data.scale_markers){x.strokeStyle=r>170?"#89a9d62e":"#ffffff18";x.lineWidth=.7;x.beginPath();for(let k=0;k<=128;k++){const t=k/128*Math.PI*2,q=project([r*Math.cos(t),r*Math.sin(t),0]);k?x.lineTo(...q):x.moveTo(...q)}x.stroke();const q=project([r,0,0]);x.fillStyle="#aebbd0";x.font="9px system-ui";x.fillText(Math.abs(r-LIGHT_DAY_AU)<1?"1 light-day":Math.abs(r-2*LIGHT_DAY_AU)<2?"2 light-days":Math.round(r)+" AU",q[0]+3,q[1])}
const sun=project([0,0,0]);x.fillStyle="#fff";x.beginPath();x.arc(...sun,3,0,Math.PI*2);x.fill();if(showLabels){x.fillStyle="#fff";x.fillText("Sun",sun[0]+6,sun[1])}
for(const o of data.objects.filter(o=>o.elements)){if(showOrbits){x.strokeStyle="#8aa4c835";x.beginPath();sampleOrbit(o.elements,180).forEach((p,k)=>{const q=project(p);k?x.lineTo(...q):x.moveTo(...q)});x.stroke()}const p=project(positionFromElements(o.elements,o.elements.epoch_jd)),rad=o.kind==="planet"?2.6:2;x.fillStyle="#e5edff";x.beginPath();x.arc(...p,rad,0,Math.PI*2);x.fill();if(showLabels){x.fillStyle="#d9e5ff";x.font="10px system-ui";x.fillText(o.label,p[0]+5,p[1])}}
for(const r of data.composed_records??[]){const o=renderRecordToCanvasPoint(r);if(!o)continue;const p=project(o.position_au);x.fillStyle=o.origin_status==="confirmed-interstellar"?"#fff":"#e5edff";x.beginPath();x.arc(...p,2.2,0,Math.PI*2);x.fill();if(showLabels){x.fillStyle="#d9e5ff";x.font="10px system-ui";x.fillText(o.label,p[0]+5,p[1])}}
}
requestAnimationFrame(draw);
Promise.all([
 fetch("../data/solar-system/p0-outer-solar-system.json",{cache:"no-store"}).then(r=>r.json()),
 fetch("../data/solar-system/jpl-sbdb-snapshot.json",{cache:"no-store"}).then(r=>r.json())
]).then(([base,snapshot])=>{
 const named=(snapshot.objects??[]).map(s=>({
   id:s.entity_id,label:s.name,kind:"small-body",
   elements:{
     a:+s.elements.a.value,e:+s.elements.e.value,i_deg:+s.elements.i.value,
     node_deg:+s.elements.om.value,peri_deg:+s.elements.w.value,M_deg:+s.elements.ma.value,
     epoch_jd:s.epoch_jd_tdb
   },
   provenance:{authority:snapshot.authority,orbit_id:s.orbit_id,condition_code:s.condition_code,solution_date:s.solution_date}
 }));
 data={...base,objects:[...(base.objects??[]),...named]};
 document.querySelector("#status").textContent=named.length+" / "+snapshot.required+" named JPL orbital solutions loaded";
}).catch(()=>document.querySelector("#status").textContent="Solar-System catalogue unavailable");
c.onpointerdown=e=>{drag=[e.clientX,e.clientY];c.setPointerCapture(e.pointerId)};c.onpointermove=e=>{if(!drag)return;yaw+=(e.clientX-drag[0])*.006;pitch=Math.max(-1.4,Math.min(1.4,pitch+(e.clientY-drag[1])*.006));drag=[e.clientX,e.clientY]};c.onpointerup=()=>drag=null;c.onwheel=e=>zoom=Math.max(.3,Math.min(12,zoom*Math.exp(-e.deltaY*.001)));let pinch=null;c.addEventListener("touchmove",e=>{if(e.touches.length===2){const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);if(pinch)zoom=Math.max(.3,Math.min(12,zoom*d/pinch));pinch=d}},{passive:true});c.addEventListener("touchend",()=>pinch=null);
document.querySelector("#home").onclick=()=>{yaw=.35;pitch=.42;zoom=1};document.querySelector("#orbits").onclick=e=>{showOrbits=!showOrbits;e.currentTarget.classList.toggle("on",showOrbits)};document.querySelector("#labels").onclick=e=>{showLabels=!showLabels;e.currentTarget.classList.toggle("on",showLabels)};
