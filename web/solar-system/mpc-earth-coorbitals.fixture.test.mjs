// Published MPC regression fixture: Earth co-orbitals tutorial.
// Evidence fixture only; not production orbital catalogue.
// Source: MPC Public Documentation Hub, common epoch MJD 61200 TT.

const COMMON_EPOCH_MJD_TT=61200.0;
const MPC_PUBLISHED_STATES=Object.freeze({
  "mpc:469219":{name:"Kamoʻoalewa",position_au:[-0.471599,-0.943870,+0.005550],source_epoch_mjd_tt:61000.0},
  "mpc:3753":{name:"Cruithne",position_au:[+1.441537,-0.276973,-0.360030],source_epoch_mjd_tt:61200.0},
  "mpc:2020XL5":{name:"2020 XL5",position_au:[+1.106163,+0.248616,-0.176201],source_epoch_mjd_tt:60600.0}
});

const assert=(ok,msg)=>{if(!ok)throw new Error(msg);};
assert(COMMON_EPOCH_MJD_TT===Math.max(...Object.values(MPC_PUBLISHED_STATES).map(x=>x.source_epoch_mjd_tt)),"published common epoch is latest fit epoch");

for(const [id,x] of Object.entries(MPC_PUBLISHED_STATES)){
  assert(x.position_au.length===3&&x.position_au.every(Number.isFinite),`${id} finite published state`);
}
assert(MPC_PUBLISHED_STATES["mpc:469219"].source_epoch_mjd_tt!==COMMON_EPOCH_MJD_TT,"Kamoʻoalewa requires alignment");
assert(MPC_PUBLISHED_STATES["mpc:3753"].source_epoch_mjd_tt===COMMON_EPOCH_MJD_TT,"Cruithne already aligned");
assert(MPC_PUBLISHED_STATES["mpc:2020XL5"].source_epoch_mjd_tt!==COMMON_EPOCH_MJD_TT,"2020 XL5 requires alignment");

console.log("MPC published Earth-coorbital benchmark fixture: PASS");
