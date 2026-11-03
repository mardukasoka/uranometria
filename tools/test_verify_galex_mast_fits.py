"""Offline archive-selection safety checks; no network or coverage assertions."""
import unittest
from verify_galex_mast_fits import (select_triplet, candidate_gate_passed,
                                    recorded_evidence_matches, TARGETS, KINDS)


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


class AuthenticCandidateGateTests(unittest.TestCase):
    def valid_report(self):
        return {
            "errors": [],
            "candidate_pixels_usable_at_both_targets": True,
            "products": {kind: {} for kind in KINDS},
            "targets": {label: {
                "candidate_target_usable": True,
                "product_identity_consistent": True,
                "wcs_target_self_consistent": True,
                "positive_exposure_at_target": True,
                "positive_response_at_target": True,
            } for label in TARGETS},
        }

    def test_usable_candidate_passes_internal_gate_only(self):
        self.assertTrue(candidate_gate_passed(self.valid_report()))

    def test_download_success_with_unusable_pixels_fails(self):
        report = self.valid_report()
        report["candidate_pixels_usable_at_both_targets"] = False
        self.assertFalse(candidate_gate_passed(report))

    def test_failed_exposure_or_wcs_fails(self):
        for field in ("positive_exposure_at_target", "wcs_target_self_consistent",
                      "positive_response_at_target"):
            report = self.valid_report()
            report["targets"]["sagittarius_a_star"][field] = False
            self.assertFalse(candidate_gate_passed(report), field)

    def test_missing_target_or_product_fails(self):
        report = self.valid_report()
        del report["targets"]["galactic_origin"]
        self.assertFalse(candidate_gate_passed(report))
        report = self.valid_report()
        del report["products"]["exp"]
        self.assertFalse(candidate_gate_passed(report))

    def test_archive_errors_fail(self):
        report = self.valid_report()
        report["errors"].append("Archive unavailable")
        self.assertFalse(candidate_gate_passed(report))


class PinnedProvenanceTests(unittest.TestCase):
    def fixture(self):
        report = {
            "obsid": "5754", "tile": "MISGCEN_33205_0488", "band": "NUV",
            "products": {}, "targets": {},
        }
        reference = {
            "observation": {"obsid": "5754", "tile": "MISGCEN_33205_0488", "band": "NUV"},
            "products": {}, "targets": {},
        }
        for kind in KINDS:
            name = f"MISGCEN_33205_0488-nd-{kind}.fits.gz"
            uri = f"mast:GALEX/data/{name}"
            digest = "a" * 64
            report["products"][kind] = {"filename": name, "uri": uri,
                                        "bytes": 100, "sha256": digest}
            reference["products"][kind] = {"filename": name, "dataURI": uri,
                                           "bytes": 100, "sha256": digest}
        for label, coords in TARGETS.items():
            report["targets"][label] = {"target_icrs_deg": list(coords)}
            reference["targets"][label] = {"icrs_deg": list(coords)}
        return report, reference

    def test_matching_pinned_products_and_coordinates(self):
        report, reference = self.fixture()
        self.assertTrue(recorded_evidence_matches(report, reference))

    def test_checksum_or_size_drift_rejected(self):
        for field, replacement in (("sha256", "b" * 64), ("bytes", 101)):
            report, reference = self.fixture()
            report["products"]["exp"][field] = replacement
            self.assertFalse(recorded_evidence_matches(report, reference), field)

    def test_uri_or_observation_mismatch_rejected(self):
        report, reference = self.fixture()
        report["products"]["rr"]["uri"] = "mast:GALEX/other"
        self.assertFalse(recorded_evidence_matches(report, reference))
        report, reference = self.fixture()
        report["obsid"] = "9999"
        self.assertFalse(recorded_evidence_matches(report, reference))

    def test_coordinate_or_missing_product_rejected(self):
        report, reference = self.fixture()
        report["targets"]["sagittarius_a_star"]["target_icrs_deg"][0] += 0.1
        self.assertFalse(recorded_evidence_matches(report, reference))
        report, reference = self.fixture()
        del report["products"]["int"]
        self.assertFalse(recorded_evidence_matches(report, reference))

    def test_pinned_evidence_is_required_when_configured(self):
        report = AuthenticCandidateGateTests().valid_report()
        report["recorded_evidence_required"] = True
        report["recorded_evidence_consistent"] = False
        self.assertFalse(candidate_gate_passed(report))
        report["recorded_evidence_consistent"] = True
        self.assertTrue(candidate_gate_passed(report))


if __name__ == "__main__":
    unittest.main()
