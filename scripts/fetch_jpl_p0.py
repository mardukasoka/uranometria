#!/usr/bin/env python3
"""Fetch authoritative JPL SBDB osculating elements for Uranometria P0 small bodies."""
import json, pathlib, urllib.parse, urllib.request

ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=ROOT/"web/data/solar-system/p0-outer-solar-system.json"
TARGETS={"136199":"136199","2018 VG18":"2018 VG18","2018 AG37":"2018 AG37","90377":"90377","541132":"541132"}
FIELDS={"a":"a_au","e":"e","i":"i_deg","om":"node_deg","w":"argp_deg","ma":"M_deg"}

def get(des):
    url="https://ssd-api.jpl.nasa.gov/sbdb.api?"+urllib.parse.urlencode({"sstr":des,"full-prec":"true","cov":"mat"})
    req=urllib.request.Request(url,headers={"User-Agent":"Uranometria-JPL-ingest/0.1"})
    with urllib.request.urlopen(req,timeout=30) as r: return json.load(r),url

doc=json.loads(OUT.read_text())
by_id={o["id"]:o for o in doc["objects"]}
for oid,des in TARGETS.items():
    data,url=get(des); orb=data["orbit"]
    els={x["name"]:x for x in orb["elements"]}
    out={}
    sigma={}
    for src,dst in FIELDS.items():
        if src in els:
            out[dst]=float(els[src]["value"])
            if els[src].get("sigma") not in (None,""): sigma[dst]=float(els[src]["sigma"])
    out["epoch_jd"]=float(orb["epoch"])
    obj=by_id[oid]
    obj["elements"]=out
    obj["uncertainty_1sigma"]=sigma
    obj["provenance"]={"provider":"NASA/JPL Solar System Dynamics","service":"SBDB API","query":des,
      "orbit_solution_date":orb.get("soln_date"),"condition_code":orb.get("condition_code"),
      "data_arc_days":orb.get("data_arc"),"n_obs_used":orb.get("n_obs_used"),"retrieval_url":url}
doc["status"]="jpl-sbdb-ingested"
OUT.write_text(json.dumps(doc,indent=2,ensure_ascii=False)+"\n")
print("updated",OUT)
