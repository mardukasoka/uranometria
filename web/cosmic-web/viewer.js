const canvas=document.querySelector("#sky"),ctx=canvas.getContext("2d",{alpha:false});let scene=null,showG=true,showF=false,showA=false;
let yaw=.55,pitch=.28,zoom=1.7,drag=null,showS=false,showV=false,showD=false,activeShell=300;
let velocitySamples=[];
const shellRadii=[50,100,160,200,300];
const anchors=[
 {id:"origin",label:"Milky Way / observer",position:[0,0,0],status:"reference"},
 {id:"laniakea",label:"Laniakea centre",position:[-47,13,-5],status:"published CF reconstruction",source:"Sorce et al. constrained Local Universe simulations"},
 {id:"great-attractor",label:"Great Attractor",position:[-40,5,0],status:"CF4/WALLABY reconstruction",source:"WALLABY pilot + CF4"},
 {id:"vela",label:"Vela",position:[-130,40,-140],status:"CF4/WALLABY reconstruction",source:"WALLABY pilot + CF4"}
];
const demo={coordinateFrame:{coordinates:"supergalactic",units:"Mpc/h"},layers:[{id:"galaxies",data:[]},{id:"streamlines",data:[]}]};
function resize(){const d=Math.min(devicePixelRatio||1,2);canvas.width=innerWidth*d;canvas.height=innerHeight*d;ctx.setTransform(d,0,0,d,0,0)}addEventListener("resize",resize);resize();
function project(p){let[x,y,z]=p;const cy=Math.cos(yaw),sy=Math.sin(yaw);[x,y]=[x*cy-y*sy,x*sy+y*cy];const cp=Math.cos(pitch),sp=Math.sin(pitch);[y,z]=[y*cp-z*sp,y*sp+z*cp];const s=Math.min(innerWidth,innerHeight)*.00145*zoom;return[innerWidth/2+x*s,innerHeight/2-z*s,y]}
function drawReferenceFrame(){if(!showA)return;const refs=[
 {p:[0,0,260],l:"SG North"},{p:[0,0,-260],l:"SG South"},
 {p:[260,0,0],l:"SGX +"},{p:[-260,0,0],l:"SGX −"},
 {p:[0,260,0],l:"SGY +"},{p:[0,-260,0],l:"SGY −"}];
 ctx.strokeStyle="#ffffff30";ctx.lineWidth=.7;
 for(const seg of [[[ -300,0,0],[300,0,0]],[[0,-300,0],[0,300,0]],[[0,0,-300],[0,0,300]]]){const a=project(seg[0]),b=project(seg[1]);ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke()}
 ctx.fillStyle="#dbe6ff";ctx.font="10px system-ui";for(const r of refs){const q=project(r.p);ctx.fillText(r.l,q[0]+4,q[1])}}
function draw(){requestAnimationFrame(draw);ctx.fillStyle="#02040a";ctx.fillRect(0,0,innerWidth,innerHeight);if(!scene)return;const g=(scene.layers.find(x=>x.id==="galaxies")?.data||[]).filter(o=>Math.hypot(...o.position)<=activeShell),f=scene.layers.find(x=>x.id==="streamlines")?.data||[];
if(showS){ctx.strokeStyle="#ffffff18";ctx.lineWidth=.7;for(const r of shellRadii){ctx.beginPath();for(let i=0;i<=96;i++){const a=i/96*Math.PI*2,q=project([r*Math.cos(a),r*Math.sin(a),0]);i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])}ctx.stroke();const lab=project([r,0,0]);ctx.fillStyle="#ffffff55";ctx.font="9px system-ui";ctx.fillText(r+" h⁻¹ Mpc",lab[0]+3,lab[1]);}}
drawReferenceFrame();
if(showD){const dirs=[[0,-1,.35],[.15,-1,.25],[-.18,-1,.2]];ctx.lineWidth=1.2;dirs.forEach((d,i)=>{const a=project([0,0,0]),b=project(d.map(x=>x*180));ctx.strokeStyle=["#ffffffaa","#ffffff66","#ffffff44"][i];ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke()});}
if(showV&&velocitySamples.length){ctx.strokeStyle="#9fc2ff88";ctx.lineWidth=.7;for(const v of velocitySamples){const r=Math.hypot(...v.position);if(r>activeShell)continue;const a=project(v.position),m=Math.hypot(...v.velocity);if(!m)continue;const k=Math.min(18,m/70);const end=[v.position[0]+v.velocity[0]/m*k,v.position[1]+v.velocity[1]/m*k,v.position[2]+v.velocity[2]/m*k],b=project(end);ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();}}
if(showF){ctx.strokeStyle="#7aa7ff26";ctx.lineWidth=.55;for(const l of f){ctx.beginPath();l.points.forEach((p,i)=>{const q=project(p);i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])});ctx.stroke()}}
if(showG){for(const o of g){const q=project(o.position);const alpha=Math.max(.18,1-Math.abs(q[2])/700);ctx.fillStyle=`rgba(225,235,255,${alpha})`;ctx.fillRect(q[0],q[1],1.35,1.35)}}
ctx.font="11px system-ui";ctx.textBaseline="middle";for(const a of anchors){const q=project(a.position);ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(q[0],q[1],a.id==="origin"?3:2,0,Math.PI*2);ctx.fill();ctx.fillStyle="#d9e5ff";ctx.fillText(a.label,q[0]+6,q[1]);}
}requestAnimationFrame(draw);
async function load(){try{const r=await fetch("../data/cf4/scene-mobile.json",{cache:"no-store"});if(!r.ok)throw 0;scene=await r.json();try{const vr=await fetch("../data/cf4/velocity-samples.json",{cache:"no-store"});if(vr.ok){const vd=await vr.json();velocitySamples=(vd.objects||[]).filter((_,i)=>i%Math.max(1,Math.ceil((vd.objects||[]).length/800))===0)}}catch{}document.querySelector("#status").textContent=(scene.review?"REVIEW FIXTURE · ":"")+((scene.layers[0].count??scene.layers[0].data?.length??0).toLocaleString())+" galaxies · "+((scene.layers[1].count??scene.layers[1].data?.length??0).toLocaleString())+" flows";document.querySelector("#scale").textContent="Supergalactic · "+(scene.coordinateFrame?.units||"units provisional")}catch{scene=demo;document.querySelector("#status").textContent="Preview geometry · CF4 data not built yet";document.querySelector("#scale").textContent="Supergalactic · demonstration only"}}load();
canvas.onpointerdown=e=>{drag=[e.clientX,e.clientY];canvas.setPointerCapture(e.pointerId)};canvas.onpointermove=e=>{if(!drag)return;yaw+=(e.clientX-drag[0])*.006;pitch=Math.max(-1.4,Math.min(1.4,pitch+(e.clientY-drag[1])*.006));drag=[e.clientX,e.clientY]};canvas.onpointerup=()=>drag=null;canvas.onwheel=e=>{zoom=Math.max(.3,Math.min(8,zoom*Math.exp(-e.deltaY*.001)))};
let pinch=null;canvas.addEventListener("touchmove",e=>{if(e.touches.length===2){const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);if(pinch)zoom=Math.max(.3,Math.min(8,zoom*d/pinch));pinch=d}},{passive:true});canvas.addEventListener("touchend",()=>pinch=null);
for(const[id,key]of [["galaxies","G"],["flows","F"],["vectors","V"],["shells","S"],["axes","A"],["dipoles","D"]])document.querySelector("#"+id).onclick=e=>{if(key==="G")showG=!showG;if(key==="F")showF=!showF;if(key==="A")showA=!showA;if(key==="S")showS=!showS;if(key==="V")showV=!showV;if(key==="D")showD=!showD;e.currentTarget.classList.toggle("on")};document.querySelector("#home").onclick=()=>{yaw=.55;pitch=.28;zoom=1.7};
document.querySelector("#shell").onchange=e=>{activeShell=Number(e.target.value);zoom=Math.max(.75,Math.min(6,510/activeShell));showS=true;document.querySelector("#shells").classList.add("on")};
