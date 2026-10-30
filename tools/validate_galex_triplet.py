"""GALEX intensity/exposure/relative-response intake gate; candidate status only.

Run: python tools/validate_galex_triplet.py tile-nd-int.fits.gz tile-nd-exp.fits
     tile-nd-rr.fits --band NUV --ra 266.41683 --dec -29.00781
Requires Astropy/NumPy and the existing validate_survey_wcs.py module.
"""
import argparse
import json
import math
import re
from pathlib import Path

PATTERN = re.compile(r"^(?P<tile>.+)-(?P<band>[fn])d-(?P<kind>int|exp|rr)\.fits(?:\.gz)?$", re.I)


def identity(path):
    match = PATTERN.fullmatch(Path(path).name)
    if not match:
        return None
    return (match["tile"].lower(), {"f": "FUV", "n": "NUV"}[match["band"].lower()], match["kind"].lower())


def validate_triplet(intensity, exposure, response, ra, dec, band):
    files = {"int": str(intensity), "exp": str(exposure), "rr": str(response)}
    report = dict(target_icrs_deg=[ra, dec], band=band, files=files,
                  product_identity_consistent=False, wcs_target_self_consistent=False,
                  positive_exposure_at_target=False, positive_response_at_target=False,
                  candidate_target_usable=False, independent_archive_provenance_verified=False,
                  external_astrometry_verified=False, calibration_verified=False,
                  artifact_flags_verified=False, detection_verified=False, warnings=[])
    if band not in ("FUV", "NUV") or not all(map(math.isfinite, (ra, dec))) or not (0 <= ra < 360 and -90 <= dec <= 90):
        report["warnings"].append("Invalid band or ICRS coordinates")
        return report
    ids = {kind: identity(path) for kind, path in files.items()}
    if any(ids[k] is None or ids[k][2] != k for k in files):
        report["warnings"].append("Unrecognised GALEX product suffix")
        return report
    tile = ids["int"][0]
    if any(ids[k][:2] != (tile, band) for k in files):
        report["warnings"].append("Product tile or wavelength mismatch")
        return report
    report["product_identity_consistent"] = True
    try:
        from validate_survey_wcs import validate
        sci = validate(files["int"], ra, dec, files["exp"])
        rr = validate(files["rr"], ra, dec)
    except (ImportError, OSError, ValueError) as exc:
        report["warnings"].append("FITS validation failed: " + str(exc))
        return report
    report["science_check"] = sci
    report["response_check"] = rr
    report["wcs_target_self_consistent"] = bool(sci["wcs_validated"] and rr["wcs_validated"])
    report["positive_exposure_at_target"] = bool(sci["exposure_verified"])
    pixel = (rr.get("science_hdu") or {}).get("pixel")
    report["positive_response_at_target"] = bool(pixel is not None and math.isfinite(pixel) and pixel > 0)
    report["candidate_target_usable"] = all((
        report["product_identity_consistent"], report["wcs_target_self_consistent"],
        report["positive_exposure_at_target"], report["positive_response_at_target"],
        bool((sci.get("science_hdu") or {}).get("finite"))))
    report["warnings"].extend([
        "Filenames alone do not prove matching MAST observation identifiers.",
        "WCS round trips do not prove independent astrometric alignment.",
        "Positive exposure/response do not verify artifact masks, calibration or source detection.",
        "GALEX intensity and relative-response maps have different pixel scales; sample each via its own WCS."])
    return report


if __name__ == "__main__":
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("intensity")
    p.add_argument("exposure")
    p.add_argument("response")
    p.add_argument("--ra", type=float, required=True)
    p.add_argument("--dec", type=float, required=True)
    p.add_argument("--band", choices=["FUV", "NUV"], required=True)
    a = p.parse_args()
    print(json.dumps(validate_triplet(a.intensity, a.exposure, a.response, a.ra, a.dec, a.band), indent=2, allow_nan=False))
