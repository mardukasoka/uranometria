"""Offline GALEX product identity tests; no real survey coverage is inferred."""
import unittest
from validate_galex_triplet import identity, validate_triplet

class TripletGateTests(unittest.TestCase):
    def test_names(self):
        self.assertEqual(identity("TILE-nd-int.fits.gz"), ("tile", "NUV", "int"))
        self.assertEqual(identity("TILE-fd-rr.fits"), ("tile", "FUV", "rr"))
        self.assertIsNone(identity("TILE-nd-flags.fits.gz"))

    def test_mismatched_tile(self):
        r = validate_triplet("a-nd-int.fits.gz", "b-nd-exp.fits", "a-nd-rr.fits", 266.41683, -29.00781, "NUV")
        self.assertFalse(r["product_identity_consistent"])
        self.assertFalse(r["candidate_target_usable"])

    def test_mismatched_band(self):
        r = validate_triplet("a-nd-int.fits.gz", "a-fd-exp.fits", "a-nd-rr.fits", 266.41683, -29.00781, "NUV")
        self.assertFalse(r["candidate_target_usable"])

    def test_bad_coordinates(self):
        r = validate_triplet("a-nd-int.fits.gz", "a-nd-exp.fits", "a-nd-rr.fits", 361, -29, "NUV")
        self.assertFalse(r["candidate_target_usable"])


    def test_realistic_wcs_scale_difference_and_response_gate(self):
        """Synthetic FITS: each band product is sampled through its own WCS."""
        import tempfile
        from pathlib import Path
        import numpy as np
        from astropy.io import fits
        from astropy.wcs import WCS

        def write(path, size, scale, value):
            w = WCS(naxis=2)
            w.wcs.ctype = ["RA---TAN", "DEC--TAN"]
            w.wcs.crval = [266.41683, -29.00781]
            w.wcs.crpix = [(size + 1) / 2, (size + 1) / 2]
            w.wcs.cdelt = [-scale, scale]
            fits.PrimaryHDU(data=np.full((size, size), value, dtype=np.float32),
                            header=w.to_header()).writeto(path, overwrite=True)

        with tempfile.TemporaryDirectory() as directory:
            base = Path(directory)
            intensity = base / "tile-nd-int.fits"
            exposure = base / "tile-nd-exp.fits"
            response = base / "tile-nd-rr.fits"
            write(intensity, 32, 0.001, 2)
            write(exposure, 16, 0.002, 120)
            write(response, 16, 0.002, 0.9)
            good = validate_triplet(intensity, exposure, response,
                                    266.41683, -29.00781, "NUV")
            self.assertTrue(good["candidate_target_usable"])
            self.assertTrue(good["wcs_target_self_consistent"])
            self.assertTrue(good["positive_exposure_at_target"])
            self.assertTrue(good["positive_response_at_target"])
            self.assertFalse(good["independent_archive_provenance_verified"])
            self.assertFalse(good["external_astrometry_verified"])
            self.assertFalse(good["detection_verified"])

            write(response, 16, 0.002, 0)
            masked = validate_triplet(intensity, exposure, response,
                                      266.41683, -29.00781, "NUV")
            self.assertFalse(masked["candidate_target_usable"])
            self.assertFalse(masked["positive_response_at_target"])

            write(response, 16, 0.002, 0.9)
            write(exposure, 16, 0.002, 0)
            unexposed = validate_triplet(intensity, exposure, response,
                                         266.41683, -29.00781, "NUV")
            self.assertFalse(unexposed["candidate_target_usable"])
            self.assertFalse(unexposed["positive_exposure_at_target"])

if __name__ == "__main__":
    unittest.main()
