"""Bounded MAST GALEX FITS evidence gate for one archived observation/tile.

This verifies candidate image/exposure/response pixels through their own FITS WCS.
It does NOT establish independent astrometry, calibration or a source detection.
No FITS are published or committed. Use a known MAST obsid from the candidate inventory.
"""
import argparse
import hashlib
import json
import tempfile
from datetime import datetime, timezone
from pathlib import Path

from galex_mast_inventory import TARGETS, classify
from validate_galex_triplet import validate_triplet

MAX_FILE_BYTES = 120 * 1024 * 1024
MAX_TOTAL_BYTES = 300 * 1024 * 1024
KINDS = ("int", "exp", "rr")


def select_triplet(rows, tile, band):
    """Select one same-tile, same-band archive product per kind; reject ambiguity."""
    matches = {}
    for row in rows:
        name = str(row["productFilename"])
        identity = classify(name)
        if identity is None or identity[:2] != (tile.lower(), band):
            continue
        kind = identity[2]
        if kind in matches:
            raise ValueError(f"Duplicate {kind} product for {tile} {band}")
        uri = str(row["dataURI"])
        if not uri.startswith("mast:GALEX/"):
            raise ValueError("Unexpected non-GALEX MAST URI")
        matches[kind] = {"filename": Path(name).name, "uri": uri}
    missing = [kind for kind in KINDS if kind not in matches]
    if missing:
        raise ValueError(f"Incomplete {band} triplet for {tile}: missing {missing}")
    return matches


def download_one(uri, path, remaining):
    import requests
    if not uri.startswith("mast:GALEX/"):
        raise ValueError("Unexpected MAST URI")
    size = 0
    sha = hashlib.sha256()
    with requests.get("https://mast.stsci.edu/api/v0.1/Download/file",
                      params={"uri": uri}, stream=True, timeout=(20, 120)) as response:
        response.raise_for_status()
        with open(path, "wb") as out:
            for chunk in response.iter_content(chunk_size=1024 * 1024):
                if not chunk:
                    continue
                size += len(chunk)
                if size > MAX_FILE_BYTES or size > remaining:
                    raise ValueError("Download exceeds bounded FITS size limit")
                out.write(chunk)
                sha.update(chunk)
    with open(path, "rb") as file:
        signature = file.read(8)
    if not (signature.startswith(b"\x1f\x8b") or signature.startswith(b"SIMPLE")):
        raise ValueError("MAST response is not FITS or gzip-compressed FITS")
    return {"bytes": size, "sha256": sha.hexdigest()}


def run(obsid, tile, band):
    from astroquery.mast import Observations
    report = {
        "queried_utc": datetime.now(timezone.utc).isoformat(),
        "archive": "MAST CAOM / GALEX GR7 candidate", "obsid": str(obsid),
        "tile": tile, "band": band,
        "pixel_coverage_certified": False,
        "independent_astrometry_verified": False,
        "calibration_verified": False, "detection_verified": False,
        "products": {}, "targets": {}, "errors": [],
    }
    try:
        rows = Observations.get_product_list(str(obsid))
        triplet = select_triplet(rows, tile, band)
        remaining = MAX_TOTAL_BYTES
        with tempfile.TemporaryDirectory() as temporary:
            paths = {}
            for kind in KINDS:
                product = triplet[kind]
                path = Path(temporary) / product["filename"]
                meta = download_one(product["uri"], path, remaining)
                remaining -= meta["bytes"]
                paths[kind] = path
                report["products"][kind] = dict(product, **meta)
            for label, (ra, dec) in TARGETS.items():
                report["targets"][label] = validate_triplet(
                    paths["int"], paths["exp"], paths["rr"], ra, dec, band)
            # Internal pixel-level checks only, not independent science certification.
            report["candidate_pixels_usable_at_both_targets"] = all(
                r["candidate_target_usable"] for r in report["targets"].values())
    except Exception as exc:
        report["errors"].append(f"{type(exc).__name__}: {exc}")
    report["limitations"] = [
        "Archive IDs and product checksums are retained; FITS files are ephemeral.",
        "Internal WCS round trips are not independent astrometric verification.",
        "Positive exposure and response do not establish detection or calibration.",
        "FUV must be queried independently; a NUV candidate does not imply FUV coverage.",
    ]
    return report


if __name__ == "__main__":
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--obsid", required=True)
    p.add_argument("--tile", required=True)
    p.add_argument("--band", choices=["NUV", "FUV"], required=True)
    p.add_argument("--output", type=Path, default=Path("galex_fits_evidence.json"))
    a = p.parse_args()
    if not a.obsid.isdecimal() or not a.tile or "/" in a.tile or ".." in a.tile:
        p.error("Invalid observation ID or tile")
    result = run(a.obsid, a.tile, a.band)
    a.output.write_text(json.dumps(result, indent=2, allow_nan=False) + "\n")
    print("Saved MAST FITS evidence; candidate usable:", result.get("candidate_pixels_usable_at_both_targets"),
          "; errors:", result["errors"])
    if result["errors"]:
        raise SystemExit(1)
