"""Read-only GALEX MAST candidate inventory. No FITS downloaded or coverage certified.

Usage: python tools/galex_mast_inventory.py --output galex_candidates.json
Requires astroquery and astropy, and network access to MAST.
"""
import argparse
import json
import re
from datetime import datetime, timezone
from pathlib import Path

TARGETS = {
    "galactic_origin": (266.40499, -28.93617),
    "sagittarius_a_star": (266.41683, -29.00781),
}
PRODUCT = re.compile(r"^(?P<tile>.+)-(?P<band>[fn])d-(?P<kind>int|exp|rr)\.fits(?:\.gz)?$", re.I)


def classify(name):
    m = PRODUCT.fullmatch(Path(str(name)).name)
    if m is None:
        return None
    return (m["tile"].lower(), {"f": "FUV", "n": "NUV"}[m["band"].lower()], m["kind"].lower())

def group_candidate_products(products):
    """Group only within one MAST observation; names do not certify coverage."""
    groups = {}
    for product in products:
        tile, band, kind = product["tile"], product["band"], product["kind"]
        entry = groups.setdefault((tile, band), set())
        entry.add(kind)
    return [
        dict(tile=tile, band=band, kinds=sorted(kinds),
             complete_candidate_triplet={"int", "exp", "rr"}.issubset(kinds),
             exposure_verified=False, wcs_verified=False)
        for (tile, band), kinds in sorted(groups.items())
    ]


def scalar(value):
    if value is None or bool(getattr(value, "mask", False)):
        return None
    if hasattr(value, "item"):
        value = value.item()
    if isinstance(value, (int, float, str, bool)):
        return value
    return str(value)


def inventory(radius_arcmin=5.0, max_observations=25):
    import astropy.units as u
    from astropy.coordinates import SkyCoord
    from astroquery.mast import Observations
    report = dict(archive="MAST CAOM / GALEX", queried_utc=datetime.now(timezone.utc).isoformat(),
                  status="CANDIDATES_ONLY_NOT_COVERAGE", coverage_verified=False,
                  fits_wcs_verified=False, detector_response_verified=False, targets={})
    for label, (ra, dec) in TARGETS.items():
        rows = Observations.query_region(SkyCoord(ra, dec, unit="deg", frame="icrs"),
                                         radius=radius_arcmin * u.arcmin)
        selected = [row for row in rows if str(row["obs_collection"]).upper() == "GALEX"]
        entry = dict(icrs_deg=[ra, dec], candidate_observation_count=len(selected),
                     truncated=len(selected) > max_observations, observations=[])
        for row in selected[:max_observations]:
            obsid = scalar(row["obsid"])
            item = dict(obsid=obsid, obs_id=scalar(row["obs_id"]),
                        filters=scalar(row["filters"]), s_ra=scalar(row["s_ra"]),
                        s_dec=scalar(row["s_dec"]), products=[])
            products = Observations.get_product_list(int(obsid))
            for product in products:
                name = scalar(product["productFilename"])
                match = classify(name)
                if match is None:
                    continue
                tile, band, kind = match
                item["products"].append(dict(filename=name, tile=tile, band=band,
                                             kind=kind, dataURI=scalar(product["dataURI"]) if "dataURI" in products.colnames else None))
            item["product_groups"] = group_candidate_products(item["products"])
            entry["observations"].append(item)
        report["targets"][label] = entry
    report["limitations"] = [
        "Cone-search candidates are not proof of pixel-level exposure or usable coverage.",
        "Only matched same-observation intensity/exposure/relative-response FITS with WCS checks can advance the UV gate.",
        "No source detection or independent astrometric registration is established."]
    return report


if __name__ == "__main__":
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--radius-arcmin", type=float, default=5.0)
    p.add_argument("--max-observations", type=int, default=25)
    p.add_argument("--output", type=Path, default=Path("galex_candidates.json"))
    args = p.parse_args()
    if not (0 < args.radius_arcmin <= 60 and 0 < args.max_observations <= 100):
        p.error("Invalid query bounds")
    result = inventory(args.radius_arcmin, args.max_observations)
    args.output.write_text(json.dumps(result, indent=2, allow_nan=False) + "\n")
    print("Saved candidate metadata to", args.output, "(not scientific coverage verification)")
