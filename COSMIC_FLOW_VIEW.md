# Multi-dipole + multi-scale cosmic-flow view

This is the first implementation contract for the Uranometria cosmic-web comparison instrument.

## Goal

Render the CMB dipole, Gaia quasar acceleration dipole, quasar/radio count dipoles, CF4 peculiar-velocity field, streamlines, basins, and named attractor/repeller structures without collapsing unlike observables into one "cosmic dipole".

## Coordinate policy

The local 3D web uses supergalactic Cartesian coordinates. Sky-native dipoles retain their native ICRS/Galactic measurement and are transformed only for display, with the source frame preserved in provenance.

## Scale control

Initial shells: 50, 100, 200, and 300 h^-1 Mpc, plus an external category. The UI should show shell-specific flow vectors/covariance rather than a single universal bulk-flow arrow.

## Evidence controls

Observed / Reconstructed / Inferred / Simulated remain independently switchable. Bulk flow and historical Dark Flow claims are separate concepts. Survey masks, selection/window functions, covariance, and reconstruction uncertainty must remain inspectable.

## First adapter

Use the external Laniakea/CF4 pipeline as a normalized-data producer. Uranometria should ingest compact JSON for positions, velocities, streamlines, basin membership/boundaries and provenance rather than copy the Python/WebGPU implementation into this repository.

## Mobile-first rendering target

Progressively load named structures and sparse vectors first; streamlines and dense fields follow as optional detail. Selected structures/flows receive labels and uncertainty geometry. Phones should display cached normalized reconstruction products rather than recompute the CF4 field.
