# Cosmology layer v0.1

This layer extends Uranometria from a sky-catalogue baker toward an evidence-driven cosmology atlas while preserving the existing compact, reproducible catalogue pipeline.

## Invariant

**Observation → Reconstruction → Physical model → Inference** are separate data classes. A rendered simulation must never silently replace an observation.

## First six evidence domains

1. H0 tension
2. JWST early-Universe populations
3. Gaia/quasar/CMB dipoles
4. Bulk and dark-flow tests
5. MOND / QUMOND / GR comparisons
6. Attractor / repeller cosmic-web structure

Each record carries an explicit coordinate frame, provenance, uncertainty/confidence and evidence type. This is the cosmological analogue of keeping normal atoms, exotic atoms, antimatter and model variants distinguishable while allowing them to be compared in one interface.

## Engine adapters

External scientific engines remain independent repositories/services. Uranometria consumes normalized outputs rather than copying their implementations.

- Laniakea / CosmicFlows-4: observed/reconstructed local density and peculiar-velocity fields, streamlines, basins.
- Cobaya + CLASS/CAMB: H0 and cosmological parameter likelihood/model comparison.
- PySCo: matched-initial-condition structure formation under Newtonian/GR-like, MOND/QUMOND and modified-gravity models.
- JWST: catalogue/photometry/spectroscopy forward-inference records; do not treat luminosity, stellar mass and halo mass as interchangeable.
- Dipoles: catalogue-native measurements with masks, selection functions and native units.

## Rendering contract

A future viewer should expose toggles for Observed / Reconstructed / Simulated / Inferred, plus provenance and uncertainty. Supergalactic coordinates are preferred for the local cosmic-web view; sky dipoles remain in ICRS/Galactic frames as appropriate.

This v0.1 deliberately adds no heavy runtime dependency and no survey data to git.
