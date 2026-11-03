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



def candidate_gate_passed(report):
    """Fail closed unless both targets pass the *internal* FITS/WCS exposure gate.

    This is not a claim of independent astrometry, calibration or UV detection.
    A successful download with unusable target pixels must not produce green CI.
    """
    if report.get("errors") or report.get("candidate_pixels_usable_at_both_targets") is not True:
        return False
    if report.get("recorded_evidence_required") and report.get("recorded_evidence_consistent") is not True:
        return False
    products = report.get("products")
    if not isinstance(products, dict) or set(products) != set(KINDS):
        return False
    targets = report.get("targets")
    if not isinstance(targets, dict) or set(targets) != set(TARGETS):
        return False
    required = ("candidate_target_usable", "product_identity_consistent",
                "wcs_target_self_consistent", "positive_exposure_at_target",
                "positive_response_at_target")
    return all(isinstance(targets[label], dict) and
               all(targets[label].get(flag) is True for flag in required)
               for label in TARGETS)



def recorded_evidence_matches(report, reference):
    """Compare fresh MAST download hashes/metadata to pinned local evidence.

    This detects archive/product drift; it is NOT an independently signed
    archive checksum, calibrated detection, or astrometric certification.
    """
    if not isinstance(reference, dict):
        return False
    observation = reference.get("observation")
    products = reference.get("products")
    targets = reference.get("targets")
    live_products = report.get("products")
    live_targets = report.get("targets")
    if not all(isinstance(item, dict) for item in
               (observation, products, targets, live_products, live_targets)):
        return False
    if (str(observation.get("obsid")) != str(report.get("obsid")) or
            observation.get("tile") != report.get("tile") or
            observation.get("band") != report.get("band")):
        return False
    for kind in KINDS:
        expected = products.get(kind)
        actual = live_products.get(kind)
        if not isinstance(expected, dict) or not isinstance(actual, dict):
            return False
        if any(expected.get(ref_key) != actual.get(live_key)
               for ref_key, live_key in
               (("filename", "filename"), ("dataURI", "uri"),
                ("bytes", "bytes"), ("sha256", "sha256"))):
            return False
    for label, coords in TARGETS.items():
        expected = targets.get(label)
        actual = live_targets.get(label)
        if not isinstance(expected, dict) or not isinstance(actual, dict):
            return False
        if (expected.get("icrs_deg") != list(coords) or
                actual.get("target_icrs_deg") != list(coords)):
            return False
    return True


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


def run(obsid, tile, band, expected_evidence=None):
    from astroquery.mast import Observations
    report = {
        "queried_utc": datetime.now(timezone.utc).isoformat(),
        "archive": "MAST CAOM / GALEX GR7 candidate", "obsid": str(obsid),
        "tile": tile, "band": band,
        "pixel_coverage_certified": False,
        "independent_astrometry_verified": False,
        "calibration_verified": False, "detection_verified": False,
        "products": {}, "targets": {}, "errors": [],
        "recorded_evidence_required": expected_evidence is not None,
        "recorded_evidence_consistent": False,
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
            if expected_evidence is not None:
                reference = json.loads(Path(expected_evidence).read_text(encoding="utf-8"))
                report["recorded_evidence_consistent"] = recorded_evidence_matches(report, reference)
                if not report["recorded_evidence_consistent"]:
                    report["errors"].append("Fresh GALEX products or coordinates differ from pinned provenance evidence")
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
    p.add_argument("--expected-evidence", type=Path,
                   help="Compare fresh products to pinned metadata and SHA-256 (not archive-signed)")
    a = p.parse_args()
    if not a.obsid.isdecimal() or not a.tile or "/" in a.tile or ".." in a.tile:
        p.error("Invalid observation ID or tile")
    result = run(a.obsid, a.tile, a.band, expected_evidence=a.expected_evidence)
    a.output.write_text(json.dumps(result, indent=2, allow_nan=False) + "\n")
    print("Saved MAST FITS evidence; candidate usable:", result.get("candidate_pixels_usable_at_both_targets"),
          "; errors:", result["errors"])
    if not candidate_gate_passed(result):
        print("FAIL: authentic GALEX candidate gate not satisfied; no coverage certification.")
        raise SystemExit(1)
