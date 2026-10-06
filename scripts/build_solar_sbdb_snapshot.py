#!/usr/bin/env python3
import json, pathlib, time, urllib.parse, urllib.request
ROOT=pathlib.Path(__file__).resolve().parents[1]
manifest=json.loads((ROOT/"web/data/solar-system/visual-presence-manifest.json").read_text())
out={"schema":"uranometria.jpl-sbdb-snapshot.v0.1","authority":"NASA/JPL SBDB","objects":[],"failures":[]}
for idx,o in enumerate(manifest["objects"],1):
    key=o.get("designation") or o["name"]
    url="https://ssd-api.jpl.nasa.gov/sbdb.api?"+urllib.parse.urlencode({"sstr":key,"full-prec":"true","cd-epoch":"true"})
    try:
        with urllib.request.urlopen(url,timeout=30) as r: d=json.load(r)
        if d.get("code")==300 or "orbit" not in d:
            raise ValueError(d.get("message","ambiguous or missing orbit"))
        el={x["name"]:{"value":x.get("value"),"sigma":x.get("sigma"),"units":x.get("units")} for x in d["orbit"]["elements"]}
        need=("a","e","i","om","w","ma")
        if any(not el.get(k,{}).get("value") for k in need): raise ValueError("missing bound-orbit elements")
        out["objects"].append({"entity_id":o["entity_id"],"name":o["name"],"designation":key,
          "epoch_jd_tdb":float(d["orbit"]["epoch"]),"equinox":d["orbit"].get("equinox"),"orbit_id":d["orbit"].get("orbit_id"),
          "condition_code":d["orbit"].get("condition_code"),"solution_date":d["orbit"].get("soln_date"),
          "elements":{k:el[k] for k in need},"model_parameters":d["orbit"].get("model_pars",[]),
          "source_url":url})
    except Exception as e: out["failures"].append({"entity_id":o["entity_id"],"name":o["name"],"lookup":key,"error":str(e)})
    time.sleep(.12)
out["required"]=len(manifest["objects"]); out["resolved"]=len(out["objects"]); out["failed"]=len(out["failures"])
(ROOT/"web/data/solar-system/jpl-sbdb-snapshot.json").write_text(json.dumps(out,indent=2,ensure_ascii=False)+"\n")
print(f"resolved={out['resolved']} failed={out['failed']} required={out['required']}")
if out["failures"]: print(json.dumps(out["failures"],indent=2,ensure_ascii=False))
