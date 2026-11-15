# Exoplanet observation provenance — verified starter set

Updated 2026-11-15. This file records **published observations**, not fabricated archive dataset identifiers. Program IDs from a secondary compilation must be cross-checked against MAST before being treated as observation-level provenance.

| Target | Facility/instrument | Observed filters / wavelength | Observation date | Published image / paper | Archive | Evidence role |
|---|---|---|---|---|---|---|
| Epsilon Indi Ab | JWST / MIRI coronagraph | 10.65 and 15.50 μm | 2023-07-03 | [NASA image](https://science.nasa.gov/asset/webb/epsilon-indi-ab-exoplanet-miri-image/), [peer-reviewed paper](https://pmc.ncbi.nlm.nih.gov/articles/PMC11424479/) | [MAST](https://mast.stsci.edu/) | Direct imaging; stellar RV and astrometric acceleration independently supported companion |
| 14 Herculis c | JWST / NIRCam coronagraph | 4.44 μm | Not verified here | [NASA image](https://science.nasa.gov/asset/webb/14-herculis-c-nircam/), [AAS abstract](https://baas.aas.org/pub/2025n4i116p02/release/1) | [MAST](https://mast.stsci.edu/) | Imaging at position predicted by independent RV and absolute astrometry |
| HR 8799 b–e | JWST / NIRCam | Multiple filters; verify per exposure | Not verified here | [NASA image](https://science.nasa.gov/asset/webb/hr-8799-nircam-image/) | [MAST](https://mast.stsci.edu/) | Multiple directly imaged planets; repeated relative astrometry and spectra |
| HIP 65426 b | JWST / NIRCam and MIRI | Multiple infrared filters | Not verified here | [NASA science release](https://science.nasa.gov/missions/webb/webb-takes-its-first-ever-direct-image-of-distant-world/) | [MAST](https://mast.stsci.edu/) | Multi-instrument direct imaging |
| Beta Pictoris c | VLTI / GRAVITY | Near infrared | Not verified here | [ESO GRAVITY](https://www.eso.org/sci/facilities/paranal/instruments/gravity.html) | [ESO](https://archive.eso.org/) | Planet independently discovered via stellar RV and later imaged |

## Evidence standards

- **Independent confirmation:** distinct physical measurements of the same companion, e.g. stellar RV + stellar astrometry + direct imaging.
- **Relative astrometry:** motion of an already imaged companion; valuable for orbital constraints but not equivalent to stellar reflex astrometry.
- **Planetary RV:** Doppler shift in the planet's own spectrum; distinct from stellar RV discovery.
- **Spectroscopy:** characterization of a directly detected source, not automatically independent detection.
- **Disk morphology/accretion:** supporting evidence that can be model-dependent.
- **Archive landing page ≠ observation-specific FITS link.** Record programme ID, observation ID, product URI, epoch, filter, DOI and reduction pipeline only after source verification.

## Sources and catalogues

- [NASA Exoplanet Archive](https://exoplanetarchive.ipac.caltech.edu/)
- [MAST](https://mast.stsci.edu/)
- [ESO Science Archive](https://archive.eso.org/)
- [Gemini Observatory Archive](https://archive.gemini.edu/)
- [Keck Observatory Archive](https://koa.ipac.caltech.edu/)
- [ALMA Science Archive](https://almascience.nrao.edu/aq/)

## Open validation work

1. Split multi-planet rows into one record per planet.
2. Reconcile distances and classifications with current NASA Exoplanet Archive.
3. Obtain MAST/ESO observation IDs and verified FITS product URLs.
4. Add explicit stellar-reflex vs relative-astrometry categories.
5. Extend the sample to newly confirmed imaged planets and companions, with evidence per object.
