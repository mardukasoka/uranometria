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

if __name__ == "__main__":
    unittest.main()
