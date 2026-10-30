# Cosmic Compass: CMZ → Full Sky integration contract

Status: design contract only. This document does **not** certify the GALEX UV deployment, survey footprints, FITS/WCS registration or the later panoramic viewer.

## Release gates

1. **GC UV scientific gate:** obtain genuine GALEX FUV/NUV products or verified no-coverage results; check footprints and exposure maps independently; preserve release, observation IDs, wavelength, epoch, FITS headers, units and WCS; test mobile rendering.
2. **Compass gate:** implement Galactic Centre, Anticentre, North, South, CMB-dipole forward and opposite directions with independent provenance and coordinate transforms. CMB dipole axes must never be relabelled Galactic axes. Verify per-band availability.
3. **Panorama gate:** after compass completion, integrate zoomable CMZ to full sky as an extension of the same shared viewer, not a separate catalogue or globe.

## Scientific coordinate contract

- Canonical pointing: ICRS right ascension and declination in degrees, with Galactic longitude/latitude derived using an IAU-standard transformation.
- Store reference frame, equinox/epoch when relevant, and target identity separately from camera pointing.
- Galactic coordinate origin (l=0,b=0) is not the precise radio astrometric position of Sgr A*.
- Image mode is an angular sky projection, **not** physical motion through a 3D Galaxy.
- A 3D Galactocentric mode requires distances, uncertainties and an explicit Sun-to-Galactic-Centre convention.
- Wide-field projection: switch from local TAN cutouts to a full-sky projection (e.g. Mollweide or an interactive spherical texture) before TAN becomes inappropriate. Preserve sky centre and overlays through transition.
- All image comparisons require a shared WCS/reprojection grid, not CSS scaling of unrelated FITS rasters.

## Continuous exploration levels

| Level | Scientific scope | Data families | Notes |
| --- | --- | --- | --- |
| Nuclear | Sgr A*, central parsec | radio/interferometry, infrared, X-ray | Physical distances and angular sizes must be labelled |
| Nuclear cluster | inner few parsecs | infrared, X-ray | Extinction and crowding warnings |
| CMZ | central several hundred parsecs | radio lines, mm/sub-mm continuum, far-IR, X-ray | Molecular gas, dust, filaments and star formation |
| Bulge | inner kiloparsecs | near-IR, optical, X-ray | Survey footprints differ |
| Galactic panorama | Galactic plane and high latitudes | HI, CO, IR, optical, X-ray | Distinguish 2D emission maps from 3D structure |
| Full sky | entire celestial sphere | all-sky surveys by band | Use all-sky projection and provenance |

The CMZ is a physical region, not a fixed angular aperture; show adopted distance and physical-to-angular scale conversion, with uncertainties where meaningful.

## Viewer controls

- Mobile-first pinch zoom, pan, centre-on-object, orientation reset and accessible keyboard/button alternatives.
- Band switcher: radio, microwave, sub-mm, infrared, optical, UV, X-ray, gamma ray; disabled/unavailable bands explain why.
- Survey selector and footprint toggle, observation provenance panel, WCS coordinate readout and scale bar.
- Compare modes: side-by-side or swipe after verified reprojection; never imply physically simultaneous observations.
- Zoom presets from sub-arcminute through tens of degrees to 360°; actual availability depends on survey and projection.
- Cache only derived imagery with release/observation ID, projection, FOV, pixel dimensions and processing version in cache keys.
- No fake pixels for missing observations, no stretching a partial footprint across a full field.
- Prefer existing Uranometria UI and deep-sky-survey registry. Any new modules should be adapters rather than parallel scientific infrastructure.

## Candidate source families (validate per target)

- UV: GALEX MAST archive and targeted UV observations; separate FUV/NUV coverage.
- Near/far infrared: 2MASS, WISE, Spitzer/Herschel archives as appropriate.
- Molecular CMZ: published CO and other molecular-line surveys, with velocity axis retained where available.
- Radio: HI surveys and continuum products, observing frequency and beam size displayed.
- X-ray: Chandra/XMM/eROSITA products subject to coverage, processing and access conditions.
- Gamma: Fermi-LAT all-sky maps, including energy bin and PSF information.

These are candidate families, not claims that each source covers every view.

## Validation checklist

- Coordinate transform round-trip and pole/wrap tests.
- FITS pixel-to-world checks against known astrometric references.
- Coverage intersection tests including empty, partial and complete fields.
- FUV versus NUV footprint separation.
- Wavelength metadata and bandpass correctness.
- Mobile memory/performance and keyboard accessibility.
- Wide-field projection transition tests near RA=0 and Galactic longitude wrap.
- No regression in existing cosmic-web/cardinal-worldlines and outer-solar-system pages.

## Implementation order

Do not mark UV as deployed merely because a GitHub Pages URL or external SkyView link responds. The UV scientific gate requires validated actual data and visible provenance. Do not promote the panoramic phase until all six compass directions pass their respective coverage and coordinate tests.
