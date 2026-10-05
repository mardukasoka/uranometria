# Uranometria small-body implementation plan v0.1

Status: Pass 3 implementation gate.

## Goal
Enrich Uranometria's existing Solar-System domain with minor bodies without importing or embedding a competing Solar-System renderer.

## Pipeline
source orbit record
  -> normalized stable entity record
  -> classification metadata
  -> propagation to requested/common epoch
  -> camera-relative render proxy
  -> population/LOD filter

Orbital elements and their source epoch remain evidence state. Rendered Cartesian positions are disposable visual state.

## Representative validation set
Start small enough to inspect geometry and mobile behaviour before catalogue-scale ingestion.

Inner / near Earth:
- 99942 Apophis
- 433 Eros
- 3200 Phaethon

Main belt:
- 1 Ceres
- 4 Vesta
- 2 Pallas

Jupiter Trojan:
- 588 Achilles

Centaurs:
- 2060 Chiron
- 5145 Pholus
- 10199 Chariklo

Trans-Neptunian / outer:
- 134340 Pluto
- 136199 Eris
- 136108 Haumea
- 136472 Makemake
- 90377 Sedna
- 2018 VG18 (Farout)
- 2018 AG37 (Farfarout)
- 541132 Leleakuhonua (2015 TG387)

Co-orbital / quasi-satellite validation objects are added as a separate Earth-relative test set once the heliocentric geometry passes.

## Required validation
1. Parse all six Keplerian elements and epoch.
2. Preserve source classification and Atlas-derived population separately.
3. Propagate all displayed bodies to a common requested epoch.
4. Verify orbit orientation: inclination, node and argument of perihelion.
5. Verify perihelion/aphelion distances against source-derived values.
6. Confirm Centaur filter independently selects Chiron, Pholus and Chariklo.
7. Confirm outer-system camera can move Jupiter -> Centaurs -> Neptune -> TNOs without changing the global scale-spine state.
8. Measure mobile frame time and memory before increasing object count.

## LOD progression
LOD0: planets + named validation objects.
LOD1: representative objects per population.
LOD2: population chunks with orbit lines only for selection/focus.
LOD3: dense point population; selected/focused orbit only.
LOD4: statistical/density representation when individual points cease to be useful.

Do not draw tens of thousands of orbit polylines simultaneously on mobile.

## Provenance
Primary orbit authority: Minor Planet Center orbital records/API where available.
Imported Atlas-of-Space or Universe-Atlas records retain their upstream provenance and are normalized into this schema rather than treated as a second authority.
Dynamical subclasses that require long integrations (especially detailed TNO subclasses) may use a specialist classifier; classifier/version/confidence must be retained.
