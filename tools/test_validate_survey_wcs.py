"""Offline WCS validation tests using synthetic FITS; not real GALEX coverage."""
import tempfile
import unittest
from pathlib import Path

try:
    import numpy as np
    from astropy.io import fits
    from astropy.wcs import WCS
    from validate_survey_wcs import validate
    HAS_ASTROPY = True
except ImportError:
    HAS_ASTROPY = False


@unittest.skipUnless(HAS_ASTROPY, "Astropy and NumPy required")
class WcsGateTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.science = Path(self.tmp.name) / "science.fits"
        self.exposure = Path(self.tmp.name) / "exposure.fits"

    def tearDown(self):
        self.tmp.cleanup()

    def make_fits(self, path, value, extension=False):
        w = WCS(naxis=2)
        w.wcs.crpix = [16.5, 16.5]
        w.wcs.cdelt = [-0.001, 0.001]
        w.wcs.crval = [266.41683, -29.00781]
        w.wcs.ctype = ["RA---TAN", "DEC--TAN"]
        data = np.full((32, 32), value, dtype=np.float32)
        image = fits.ImageHDU(data=data, header=w.to_header()) if extension else fits.PrimaryHDU(data=data, header=w.to_header())
        fits.HDUList([fits.PrimaryHDU(), image]).writeto(path) if extension else image.writeto(path)

    def test_no_exposure_never_verifies_coverage(self):
        self.make_fits(self.science, 5)
        r = validate(self.science, 266.41683, -29.00781)
        self.assertTrue(r["wcs_validated"])
        self.assertTrue(r["footprint_contains_target"])
        self.assertFalse(r["exposure_verified"])
        self.assertFalse(r["detection_verified"])

    def test_positive_exposure_in_extension(self):
        self.make_fits(self.science, 5, extension=True)
        self.make_fits(self.exposure, 120, extension=True)
        r = validate(self.science, 266.41683, -29.00781, self.exposure)
        self.assertTrue(r["exposure_verified"])
        self.assertEqual(r["science_hdu"]["hdu"], 1)
        self.assertEqual(r["exposure_hdu"]["hdu"], 1)
        self.assertFalse(r["detection_verified"])

    def test_zero_exposure_rejected(self):
        self.make_fits(self.science, 5)
        self.make_fits(self.exposure, 0)
        self.assertFalse(validate(self.science, 266.41683, -29.00781, self.exposure)["exposure_verified"])

    def test_off_field_rejected(self):
        self.make_fits(self.science, 5)
        r = validate(self.science, 260, -29)
        self.assertFalse(r["wcs_validated"])
        self.assertFalse(r["footprint_contains_target"])


if __name__ == "__main__":
    unittest.main()
