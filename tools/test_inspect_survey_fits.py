"""Synthetic FITS intake tests; do not imply real survey coverage."""
import tempfile
import unittest
from pathlib import Path
from inspect_survey_fits import inspect, read_header

def card(key, value):
    if isinstance(value, bool):
        val = "T" if value else "F"
    elif isinstance(value, str):
        val = "'" + value + "'"
    else:
        val = str(value)
    return f"{key:<8}= {val:<20}".ljust(80).encode("ascii")

def fixture(**overrides):
    fields = dict(SIMPLE=True, BITPIX=-32, NAXIS=2, NAXIS1=2, NAXIS2=2,
                  CTYPE1="RA---TAN", CTYPE2="DEC--TAN", CRVAL1=266.40499,
                  CRVAL2=-28.93617, CRPIX1=1.5, CRPIX2=1.5,
                  CDELT1=-0.001, CDELT2=0.001,
                  BUNIT="counts/s", TELESCOP="GALEX", INSTRUME="NUV",
                  **{"DATE-OBS":"2007-01-01"})
    fields.update(overrides)
    data = b"".join(card(k,v) for k,v in fields.items()) + b"END".ljust(80)
    return data.ljust(((len(data)+2879)//2880)*2880, b" ")

class IntakeTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.path = Path(self.temp.name)/"sample.fits"
    def tearDown(self):
        self.temp.cleanup()
    def test_header_and_conservative_flags(self):
        self.path.write_bytes(fixture())
        report=inspect(self.path)
        self.assertEqual(report["header_summary"]["CRVAL1"],266.40499)
        self.assertFalse(report["wcs_validated"])
        self.assertFalse(report["coverage_verified"])
        self.assertFalse(report["detection_verified"])
        self.assertEqual(report["warnings"],[])
    def test_missing_wcs_is_flagged(self):
        self.path.write_bytes(fixture(CTYPE1=""))
        report=inspect(self.path)
        self.assertIn("Missing provenance/units: CTYPE1", report["warnings"])
    def test_truncated_header_rejected(self):
        self.path.write_bytes(b"SIMPLE  = T")
        with self.assertRaises(ValueError):
            read_header(self.path)
    def test_slash_in_quoted_string(self):
        self.path.write_bytes(fixture(BUNIT="erg/s/cm2"))
        self.assertEqual(read_header(self.path)["BUNIT"],"erg/s/cm2")

if __name__=="__main__":
    unittest.main()
