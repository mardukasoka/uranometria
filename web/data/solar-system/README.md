# Outer Solar System integration preview

Branch: `integration/atlas-space-outer-solar-system`

This route is additive and does not replace the deployed Cosmic Web viewer.

## Scientific boundary

- Renderer coordinates: heliocentric J2000 ecliptic, AU.
- Scale markers: 30, 50, 100 AU; 1 light-day; 2 light-days.
- Orbital elements must be epoch-stamped JPL SBDB/Horizons values.
- SBDB element uncertainties should be retained at ingestion.
- A two-body osculating ellipse is a visualization/model product, not a high-accuracy ephemeris.
- Horizons remains the validation source for accurate time-dependent positions.

## P0 targets

Sun; Neptune; Pluto; Eris; 2018 VG18 (Farout); 2018 AG37 (Farfarout); 90377 Sedna; 541132 Leleākūhonua (2015 TG387).

## Mobile architecture

Population catalogues will be lazy-loaded by dynamical/orbital group rather than loaded as one asteroid cloud. Planned chunks include Atira/Vatira, Aten, Apollo, Amor, Arjuna, Earth 1:1 co-orbitals, main-belt groups/families, Trojans, Centaurs, TNO resonances, scattered/detached objects and sednoids.

Earth co-orbitals will have a separate Sun-Earth rotating-frame view for Trojan, horseshoe and quasi-satellite dynamics.

## External connectors

- Current/past mission history: ofrohn Solar System Exploration History (candidate connector).
- Prospective launch windows/mission design: mardukasoka/Anyone_trajectory_design.
