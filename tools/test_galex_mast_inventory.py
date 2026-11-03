"""Offline tests for MAST candidate grouping; never imply actual coverage."""
import unittest
from galex_mast_inventory import classify, group_candidate_products, TARGETS


class InventoryTests(unittest.TestCase):
    def test_product_suffixes(self):
        self.assertEqual(classify("TILE-nd-int.fits.gz"), ("tile", "NUV", "int"))
        self.assertEqual(classify("TILE-fd-exp.fits"), ("tile", "FUV", "exp"))
        self.assertEqual(classify("TILE-fd-rr.fits"), ("tile", "FUV", "rr"))
        self.assertIsNone(classify("TILE-nd-flags.fits.gz"))

    def test_triplets_are_separated_by_band_and_tile(self):
        products = [
            {"tile": "a", "band": "NUV", "kind": kind}
            for kind in ("int", "exp", "rr")
        ] + [
            {"tile": "a", "band": "FUV", "kind": "int"},
            {"tile": "b", "band": "NUV", "kind": "exp"},
            {"tile": "b", "band": "NUV", "kind": "rr"},
        ]
        groups = group_candidate_products(products)
        self.assertEqual(len(groups), 3)
        self.assertTrue(next(g for g in groups if g["tile"] == "a" and g["band"] == "NUV")["complete_candidate_triplet"])
        self.assertFalse(next(g for g in groups if g["band"] == "FUV")["complete_candidate_triplet"])
        self.assertFalse(next(g for g in groups if g["tile"] == "b")["complete_candidate_triplet"])
        self.assertTrue(all(not g["exposure_verified"] and not g["wcs_verified"] for g in groups))

    def test_galactic_origin_distinct_from_sgr_a_star(self):
        self.assertNotEqual(TARGETS["galactic_origin"], TARGETS["sagittarius_a_star"])

    def test_empty_products(self):
        self.assertEqual(group_candidate_products([]), [])


if __name__ == "__main__":
    unittest.main()
