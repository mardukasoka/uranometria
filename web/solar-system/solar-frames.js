// Hierarchical precision frames for Uranometria Solar-System rendering.
// Adapted conceptually from chrisjz/universe frames.ts; Uranometria retains its own axes/units semantics.

const v3=(v=[0,0,0])=>[Number(v[0]),Number(v[1]),Number(v[2])];
const add=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];

export class SolarFrame {
  constructor(name,parent=null,offset=[0,0,0],metadata={}){
    if(!name) throw new TypeError("frame name required");
    if(parent!==null && !(parent instanceof SolarFrame)) throw new TypeError("parent must be SolarFrame or null");
    this.name=String(name);
    this.parent=parent;
    this.offset=v3(offset);
    if(!this.offset.every(Number.isFinite)) throw new TypeError("finite frame offset required");
    this.metadata=Object.freeze({...metadata});
    this.depth=parent?parent.depth+1:0;
  }
  static lowestCommonAncestor(a,b){
    if(!(a instanceof SolarFrame)||!(b instanceof SolarFrame)) throw new TypeError("SolarFrame required");
    let x=a,y=b;
    while(x.depth>y.depth)x=x.parent;
    while(y.depth>x.depth)y=y.parent;
    while(x!==y){x=x.parent;y=y.parent;if(!x||!y)throw new Error("frames do not share a root");}
    return x;
  }
}

export function relativePosition(objectFrame,objectLocal,cameraFrame,cameraLocal=[0,0,0]){
  const lca=SolarFrame.lowestCommonAncestor(objectFrame,cameraFrame);
  let p=v3(objectLocal),q=v3(cameraLocal);
  for(let f=objectFrame;f!==lca;f=f.parent)p=add(p,f.offset);
  for(let f=cameraFrame;f!==lca;f=f.parent)q=add(q,f.offset);
  return sub(p,q);
}

export function reexpressPosition(sourceFrame,sourceLocal,destinationFrame){
  return relativePosition(sourceFrame,sourceLocal,destinationFrame,[0,0,0]);
}

export function createSolarFrameTree({
  sunOffset=[0,0,0],
  earthOffset=[0,0,0],
  moonOffset=[0,0,0]
}={}){
  const root=new SolarFrame("solar-system",null,[0,0,0],{frame:"heliocentric-ecliptic"});
  const sun=new SolarFrame("sun",root,sunOffset,{body:"sun"});
  const earth=new SolarFrame("earth",sun,earthOffset,{body:"earth"});
  const moon=new SolarFrame("moon",earth,moonOffset,{body:"moon"});
  return {root,sun,earth,moon};
}
