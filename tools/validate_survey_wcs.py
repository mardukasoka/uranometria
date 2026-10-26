"""Conservative offline FITS/WCS and exposure-footprint validation.

Requires astropy and numpy. Does not download survey data or assert GALEX coverage.
Usage:
 python tools/validate_survey_wcs.py science.fits --ra 266.41683 --dec -29.00781 --exposure exposure.fits
"""
import argparse
import json
import math
from pathlib import Path


def validate(science, ra, dec, exposure=None):
    import numpy as np
    from astropy.io import fits
    from astropy.wcs import WCS
    from astropy.coordinates import SkyCoord
    import astropy.units as u

    result = dict(science=str(science), target_icrs_deg=[ra, dec],
                  wcs_validated=False, footprint_contains_target=False,
                  exposure_verified=False, detection_verified=False,
                  warnings=[], science_hdu=None, exposure_hdu=None)
    target = SkyCoord(ra * u.deg, dec * u.deg, frame="icrs")

    def locate(path):
        with fits.open(path, memmap=True) as hdus:
            for i, hdu in enumerate(hdus):
                if hdu.data is None or hdu.data.ndim != 2:
                    continue
                try:
                    w = WCS(hdu.header).celestial
                    if not w.has_celestial:
                        continue
                    ny, nx = hdu.data.shape
                    if min(nx, ny) < 2:
                        continue
                    x, y = w.world_to_pixel(target)
                    if not (np.isfinite(x) and np.isfinite(y)):
                        continue
                    inside = bool(-0.5 <= x < nx - 0.5 and -0.5 <= y < ny - 0.5)
                    if not inside:
                        continue
                    back = w.pixel_to_world(x, y)
                    residual = float(target.separation(back).arcsec)
                    if not math.isfinite(residual) or residual > 0.1:
                        continue
                    # Do not load the entire array: sample only the target pixel.
                    value = float(hdu.data[int(round(y)), int(round(x))])
                    return dict(hdu=i, x=float(x), y=float(y),
                                residual_arcsec=residual, pixel=value,
                                finite=bool(np.isfinite(value)))
                except (ValueError, TypeError, IndexError, KeyError) as exc:
                    result["warnings"].append(f"HDU {i} rejected during WCS/pixel validation: {type(exc).__name__}: {exc}")
                    continue
        return None

    try:
        s = locate(science)
        if s is None:
            result["warnings"].append("No 2D celestial image HDU contains target with valid round-trip WCS")
            return result
        result["science_hdu"] = s
        result["wcs_validated"] = True
        result["footprint_contains_target"] = True
        if not s["finite"]:
            result["warnings"].append("Science target pixel is nonfinite")
        if exposure is None:
            result["warnings"].append("No exposure FITS supplied: survey coverage unverified")
            return result
        e = locate(exposure)
        if e is None:
            result["warnings"].append("Exposure map has no valid target WCS/footprint")
            return result
        result["exposure_hdu"] = e
        result["exposure_verified"] = bool(e["finite"] and e["pixel"] > 0)
        if not result["exposure_verified"]:
            result["warnings"].append("Exposure at target is zero, negative, or nonfinite")
        result["warnings"].append("Pixel checks do not establish source detection, calibration, or full-field coverage")
        return result
    except (OSError, ValueError) as exc:
        result["warnings"].append(f"FITS intake failed: {exc}")
        return result


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("science", type=Path)
    parser.add_argument("--ra", type=float, required=True)
    parser.add_argument("--dec", type=float, required=True)
    parser.add_argument("--exposure", type=Path)
    args = parser.parse_args()
    if not all(map(math.isfinite, (args.ra, args.dec))) or not (0 <= args.ra < 360 and -90 <= args.dec <= 90):
        parser.error("Invalid ICRS coordinates")
    print(json.dumps(validate(args.science, args.ra, args.dec, args.exposure), indent=2))
