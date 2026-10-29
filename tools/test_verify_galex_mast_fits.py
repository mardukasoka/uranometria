"""Offline archive-selection safety checks; no network or coverage assertions."""
import unittest
from verify_galex_mast_fits import select_triplet


class SelectTripletTests(unittest.TestCase):
    def test_exact_same_tile_band_and_kinds(self):
        rows = [dict(productFilename=f"TILE-nd-{kind}.fits.gz", dataURI=f"mast:GALEX/ok/{kind}")
                for kind in ("int", "exp", "rr")]
        rows.append(dict(productFilename="TILE-fd-int.fits.gz", dataURI="mast:GALEX/fuv"))
        result = select_triplet(rows, "TILE", "NUV")
        self.assertEqual(set(result), {"int", "exp", "rr"})
        self.assertEqual(result["int"]["filename"], "TILE-nd-int.fits.gz")

    def test_missing_or_duplicate_rejected(self):
        one = dict(productFilename="TILE-nd-int.fits.gz", dataURI="mast:GALEX/ok")
        with self.assertRaisesRegex(ValueError, "Incomplete"):
            select_triplet([one], "TILE", "NUV")
        with self.assertRaisesRegex(ValueError, "Duplicate"):
            select_triplet([one, one], "TILE", "NUV")

    def test_untrusted_uri_rejected(self):
        rows = [dict(productFilename=f"TILE-nd-{kind}.fits.gz", dataURI="https://elsewhere.test")
                for kind in ("int", "exp", "rr")]
        with self.assertRaisesRegex(ValueError, "non-GALEX"):
            select_triplet(rows, "TILE", "NUV")


if __name__ == "__main__":
    unittest.main()
