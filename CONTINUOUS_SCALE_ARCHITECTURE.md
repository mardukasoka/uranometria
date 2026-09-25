# Continuous-scale architecture decision v0.1

Status: accepted planning baseline after independent architecture review.

## Decision
Uranometria will present continuous zoom, but will not use one universal metric render space.

A shared entity/evidence graph feeds scale-domain renderers:
Solar System -> Solar neighbourhood -> Milky Way -> Local Group -> Local Universe -> Cosmic Web.

Each domain owns a local origin, native units, LOD policy and data budget. CPU spatial state uses fp64. GPU geometry is camera-relative fp32. Physical state is separate from visual proxy.

## Coordinate architecture
Coordinate frames are not labels. A frame record includes orientation, origin, epoch/time standard, velocity/rest-frame semantics and units. Volumetric transforms are rigid transforms (SE(3)) where applicable.

d3-celestial remains useful as a provenance/reference implementation and for 2D sky/planisphere views. It is not the core 3D transform engine.

Primary anchors:
- heliocentric/barycentric: Solar System and nearby stars
- Galactocentric: Milky Way, satellites, streams
- Local Group barycentric: Local Group
- cosmological/CMB or explicitly documented reconstruction frame: Local Universe/Cosmic Web

## Scientific invariant
Observation -> Reconstruction -> Physical Model -> Inference remain distinct.
Redshift-space positions must never be silently substituted for reconstructed metric positions.
Selections/completeness (including Galactic Zone of Avoidance) are first-class overlays.

## Identity
Introduce stable abstract entity IDs. An entity may have multiple scale-dependent visual proxies but one physical/evidence identity. Each proxy has an activation window in log scale.

## Mobile
Do not ship raw large 3D grids. Prefer offline-derived, provenance-bound products:
- quantized/decimated meshes for surfaces/basins
- packed polylines for streamlines
- binary typed-array chunks for point catalogues
- scale-domain spatial indexes and progressive loading

## Dynamics
Missing 6D stellar phase space is explicit. Never synthesize missing radial velocity.
Long-timescale stellar trajectories are precomputed/off-thread; linear propagation and Galactic-potential integration are separate model modes.

## Uncertainty
Distance/posterior uncertainty, reconstruction covariance and selection effects must be representable. Point markers must not imply false precision where the evidence is volumetric/probabilistic.

## Immediate implementation gates
1. Frame/origin schema and tested transform library.
2. Stable entity identity + visual-proxy schema.
3. Scale-domain manager and logarithmic scale state.
4. Genuine CF4 subset with explicit redshift/reconstruction semantics.
5. Milky Way/Local Group dataset inventory.
6. Mobile binary/LOD prototype.
7. Only then join domains into continuous zoom.

## Deferred
- full raw CF4 volume raymarching on mobile
- client-side integration of very large stellar populations
- photorealistic Galaxy
- inferred spiral arms without uncertainty encoding
- seamless all-scale renderer before transform/identity tests pass
