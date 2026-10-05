// Cross-domain Solar-System validation entities.
// Identity/authority fixtures only: positions must be supplied by validated ephemeris adapters.

export const CROSS_DOMAIN_ENTITIES=Object.freeze([
  Object.freeze({entity_id:"sc:voyager1",name:"Voyager 1",kind:"spacecraft",parent_id:"sun",origin_status:"native",propagation_authority:"jpl-horizons",sources:["JPL Horizons"],metadata:{fixture:true}}),
  Object.freeze({entity_id:"sc:voyager2",name:"Voyager 2",kind:"spacecraft",parent_id:"sun",origin_status:"native",propagation_authority:"jpl-horizons",sources:["JPL Horizons"],metadata:{fixture:true}}),
  Object.freeze({entity_id:"sc:new-horizons",name:"New Horizons",kind:"spacecraft",parent_id:"sun",origin_status:"native",propagation_authority:"jpl-horizons",sources:["JPL Horizons"],metadata:{fixture:true}}),

  Object.freeze({entity_id:"sb:1I",designation:"1I/2017 U1",name:"ʻOumuamua",kind:"interstellar-object",parent_id:"sun",origin_status:"confirmed-interstellar",orbit_facets:["hyperbolic"],propagation_authority:"jpl-horizons",sources:["JPL Horizons","MPC"],metadata:{fixture:true}}),
  Object.freeze({entity_id:"sb:2I",designation:"2I/Borisov",name:"Borisov",kind:"interstellar-object",parent_id:"sun",origin_status:"confirmed-interstellar",orbit_facets:["hyperbolic"],propagation_authority:"jpl-horizons",sources:["JPL Horizons","MPC"],metadata:{fixture:true}}),
  Object.freeze({entity_id:"sb:3I",designation:"3I/ATLAS",name:"ATLAS",kind:"interstellar-object",parent_id:"sun",origin_status:"confirmed-interstellar",orbit_facets:["hyperbolic"],propagation_authority:"jpl-horizons",sources:["JPL Horizons","MPC"],metadata:{fixture:true}})
]);

export function crossDomainEntity(id){
  return CROSS_DOMAIN_ENTITIES.find(e=>e.entity_id===id)??null;
}
