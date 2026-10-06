(function(){
"use strict";
var canvas=document.getElementById("solar"),status=document.getElementById("status");
if(!canvas||!status)return;
var ctx=canvas.getContext("2d"),data=null,mode="outer",zoom=1,yaw=.35,pitch=.42,drag=null;
function resize(){var d=Math.min(window.devicePixelRatio||1,2);canvas.width=window.innerWidth*d;canvas.height=window.innerHeight*d;canvas.style.width=window.innerWidth+"px";canvas.style.height=window.innerHeight+"px";ctx.setTransform(d,0,0,d,0,0)}
function project(p){var a=p[0],bb=p[1],z=p[2]||0,cy=Math.cos(yaw),sy=Math.sin(yaw),aa=a*cy-bb*sy,b=a*sy+bb*cy,cp=Math.cos(pitch),sp=Math.sin(pitch),zz=b*sp+z*cp;base=(mode==="inner"?Math.min(innerWidth,innerHeight)*.026:Math.min(innerWidth,innerHeight)*.00125)*zoom;return[innerWidth/2+aa*base,innerHeight/2-zz*base]}
var base=1;
function draw(){ctx.fillStyle="#02040a";ctx.fillRect(0,0,innerWidth,innerHeight);var s=project([0,0,0]);ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(s[0],s[1],3,0,Math.PI*2);ctx.fill();ctx.font="10px system-ui";ctx.fillText("Sun",s[0]+6,s[1]);if(data&&data.objects){for(var n=0;n<data.objects.length;n++){var o=data.objects[n],e=o.elements;if(!e)continue;var M=(e.M_deg||0)*Math.PI/180,E=M;for(var k=0;k<8;k++)E=M+e.e*Math.sin(E);var x=e.a_au*(Math.cos(E)-e.e),y=e.a_au*Math.sqrt(Math.max(0,1-e.e*e.e))*Math.sin(E),q=project([x,y,0]);ctx.beginPath();ctx.arc(q[0],q[1],2,0,Math.PI*2);ctx.fill();}}requestAnimationFrame(draw)}
function bind(id,fn){var el=document.getElementById(id);if(el)el.onclick=fn}
bind("home",function(){mode="outer";zoom=1;status.textContent="Outer Solar System"});
bind("inner",function(){mode="inner";zoom=1;status.textContent="Inner Solar System"});
bind("coorbitals",function(){mode="inner";zoom=1;status.textContent="Earth Co-orbitals"});
bind("nearsun",function(){mode="inner";zoom=3;status.textContent="Near-Sun"});
canvas.onpointerdown=function(e){drag=[e.clientX,e.clientY]};
canvas.onpointermove=function(e){if(!drag)return;yaw+=(e.clientX-drag[0])*.006;pitch+=(e.clientY-drag[1])*.006;drag=[e.clientX,e.clientY]};
canvas.onpointerup=function(){drag=null};
window.addEventListener("resize",resize);resize();status.textContent="Solar viewer JS OK · loading catalogue…";draw();
fetch("../data/solar-system/p0-outer-solar-system.json",{cache:"no-store"}).then(function(r){return r.json()}).then(function(d){data=d;status.textContent=(d.objects?d.objects.length:0)+" Solar-System records loaded"}).catch(function(){status.textContent="Solar viewer running · catalogue failed to load"});
})();