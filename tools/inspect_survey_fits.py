"""Minimal FITS primary-header inspector for survey intake.

Reads only FITS header cards. No image rendering, reprojecting or inference
of astronomical detections. No external Python packages required.
"""
from __future__ import annotations
import argparse
import json
import math
from pathlib import Path

BLOCK = 2880
CARD = 80

def read_header(path: str | Path) -> dict:
    values = {}
    with open(path, "rb") as file:
        for block_number in range(512):
            block = file.read(BLOCK)
            if len(block) != BLOCK:
                raise ValueError("Incomplete FITS header or missing END")
            for start in range(0, BLOCK, CARD):
                card = block[start:start + CARD].decode("ascii", errors="replace")
                name = card[:8].strip()
                if name == "END":
                    if values.get("SIMPLE") is not True:
                        raise ValueError("Not a standard primary FITS header")
                    return values
                if card[8:10] != "= ":
                    continue
                raw = card[10:].split("/", 1)[0].strip()
                if raw.startswith("'"):
                    value = raw.strip("'").strip()
                elif raw in ("T", "F"):
                    value = raw == "T"
                else:
                    try:
                        value = float(raw.replace("D", "E"))
                        if value.is_integer():
                            value = int(value)
                    except ValueError:
                        value = raw
                values[name] = value
    raise ValueError("FITS header exceeds safe inspection limit")

def inspect(path: str | Path) -> dict:
    h = read_header(path)
    warnings = []
    required = ("CTYPE1", "CTYPE2", "CRVAL1", "CRVAL2", "CRPIX1", "CRPIX2")
    missing = [key for key in required if key not in h]
    if missing:
        warnings.append("Missing WCS keys: " + ", ".join(missing))
    has_cd = all(key in h for key in ("CD1_1", "CD1_2", "CD2_1", "CD2_2"))
    has_pc = all(key in h for key in ("CDELT1", "CDELT2"))
    if not (has_cd or has_pc):
        warnings.append("No complete CD matrix or CDELT scale")
    if any(not math.isfinite(h[k]) for k in ("CRVAL1", "CRVAL2") if isinstance(h.get(k), (int, float))):
        warnings.append("Nonfinite reference coordinate")
    for key in ("BUNIT", "DATE-OBS", "TELESCOP", "INSTRUME"):
        if not h.get(key):
            warnings.append("Missing provenance/units: " + key)
    if not h.get("NAXIS", 0):
        warnings.append("No image axes in primary HDU; inspect extensions separately")
    return {
        "file": str(path),
        "header_summary": {k: h.get(k) for k in (
            "SIMPLE", "BITPIX", "NAXIS", "NAXIS1", "NAXIS2",
            "CTYPE1", "CTYPE2", "CRVAL1", "CRVAL2", "CRPIX1", "CRPIX2",
            "CDELT1", "CDELT2", "BUNIT", "DATE-OBS", "TELESCOP", "INSTRUME")},
        "warnings": warnings,
        "wcs_validated": False,
        "coverage_verified": False,
        "detection_verified": False,
    }

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("fits", nargs="+", help="FITS files to inspect")
    args = parser.parse_args()
    for filename in args.fits:
        print(json.dumps(inspect(filename), indent=2))
