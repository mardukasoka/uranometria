# Cosmological simulations — reference reconciliation (Pass 1)
This supplement is intentionally **not** a replacement for the existing `web/cosmology-simulations/index.html` timeline. It is a staging registry for deduplicating entries and checking source provenance.

| Programme | Scope | Primary reference | Verification needed |
|---|---|---|---|
| HACC / HACCabanaPM | High-performance cosmological N-body simulation | https://github.com/mardukasoka/HACCabanaPM | Confirm upstream provenance, current license, and relation to Aurora runs |
| Aurora / ALCF cosmology | Supercomputer infrastructure and simulation campaigns | https://cosmology.alcf.anl.gov/faq | Distinguish machine, campaign, code and published result |
| MEGATRON | Cosmological simulation programme | Existing Uranometria timeline entry | Check publication and upstream code before modifying timeline |
| CAMELS | Cosmological hydrodynamical simulation suites | https://github.com/mardukasoka/CAMELS | Confirm suites, versions and data licensing |
| CAMELS-SAM | Semi-analytic companion to CAMELS | https://github.com/mardukasoka/CAMELS-SAM | Identify scope and distinction from CAMELS |
| RAMSES | Adaptive mesh refinement astrophysical simulation | https://github.com/mardukasoka/ramses | Identify upstream, version and model assumptions |
| SWIFT | Cosmological hydrodynamics | https://github.com/SWIFTSIM/SWIFT | Identify version and relevant simulation campaigns |
| 21cmFAST | Cosmic dawn and reionization modelling | https://github.com/21cmfast/21cmFAST | Identify model validity domain and relevant observations |
| tangos / pynbody / yt | Analysis and data tools, **not** simulations themselves | https://github.com/mardukasoka/tangos ; https://github.com/mardukasoka/pynbody ; https://github.com/mardukasoka/yt | Classify as analysis tools rather than simulation campaigns |
| LRD observational catalogue | JWST little-red-dot observations, **not** a simulation | Existing observational layer | Crosslink observational constraints without treating them as simulations |

## Registry rules
- Separate **simulation code**, **simulation campaign**, **observational catalogue**, **analysis tool**, and **compute facility**.
- Do not claim a fork proves an upstream package is functional or scientifically validated.
- Preserve existing chronology and project references; merge only after duplicate and source checks.
- A published webpage is not evidence that the linked simulation was executed locally.
- Record coordinate conventions, time units, redshift, box size, resolution and uncertainty where applicable.

## Integration acceptance criteria
1. Audit current timeline for each entry before inserting anything.
2. Add HACC / Aurora references only where absent, with source links.
3. Maintain LRD observations as a separate linked evidence layer.
4. Confirm GitHub Pages publication and mobile rendering after an approved merge.
