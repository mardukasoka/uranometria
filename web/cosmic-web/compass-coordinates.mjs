// Cosmic Compass pure coordinate helpers. No external dependencies.
// IAU J2000 Galactic-to-ICRS rotation (transpose of ICRS-to-Galactic matrix).
export const G_TO_I = [
  [-0.0548755604162154, 0.4941094278755837, -0.8676661490190047],
  [-0.8734370902348850, -0.4448296299600112, -0.1980763734312015],
  [-0.4838350155487132, 0.7469822444972189, 0.4559837761750669]
];
const rad=Math.PI/180;
const wrap=x=>((x%360)+360)%360;
export function galacticToIcrs(l,b){
  if(!Number.isFinite(l)||!Number.isFinite(b)||Math.abs(b)>90)throw Error('Invalid Galactic coordinates');
  const x=Math.cos(b*rad)*Math.cos(l*rad),y=Math.cos(b*rad)*Math.sin(l*rad),z=Math.sin(b*rad);
  const [a,d,c]=G_TO_I.map(row=>row[0]*x+row[1]*y+row[2]*z);
  return {ra:wrap(Math.atan2(d,a)/rad),dec:Math.asin(Math.max(-1,Math.min(1,c)))/rad};
}
export function icrsToGalactic(ra,dec){
  if(!Number.isFinite(ra)||!Number.isFinite(dec)||Math.abs(dec)>90)throw Error('Invalid ICRS coordinates');
  const v=[Math.cos(dec*rad)*Math.cos(ra*rad),Math.cos(dec*rad)*Math.sin(ra*rad),Math.sin(dec*rad)];
  const [x,y,z]=[0,1,2].map(i=>G_TO_I.reduce((s,row)=>s+row[i]*v[G_TO_I.indexOf(row)],0));
  return {l:wrap(Math.atan2(y,x)/rad),b:Math.asin(Math.max(-1,Math.min(1,z)))/rad};
}
export const GALACTIC_DIRECTIONS=Object.freeze({
  centre:{l:0,b:0},anticentre:{l:180,b:0},north:{l:0,b:90},south:{l:0,b:-90}
});
export function angularSeparation(a,b){
  const u=[Math.cos(a.dec*rad)*Math.cos(a.ra*rad),Math.cos(a.dec*rad)*Math.sin(a.ra*rad),Math.sin(a.dec*rad)];
  const v=[Math.cos(b.dec*rad)*Math.cos(b.ra*rad),Math.cos(b.dec*rad)*Math.sin(b.ra*rad),Math.sin(b.dec*rad)];
  return Math.acos(Math.max(-1,Math.min(1,u.reduce((s,x,i)=>s+x*v[i],0))))/rad;
}
