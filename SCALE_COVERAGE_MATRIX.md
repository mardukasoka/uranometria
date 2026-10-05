# Scale coverage matrix v0.1

Status: Pass 2 implementation contract.

This matrix decides which project owns a scale interval. It is a routing/provenance contract, not a requirement to force all renderers into one scene.

## Precedence

1. Existing Atlas/Uranometria specialist domain.
2. Specialist external data integrated into that Atlas domain.
3. Universe Atlas provisional gap-fill representation.
4. No representation rather than silently inventing unsupported scientific detail.

Native zoom inside a specialist domain remains independent of the global Powers-of-Ten scale spine.

## Coverage

| Approximate scale | Domain | Owner / resolver action | Status |
|---|---|---|---|
| 10^27–10^24 m | observable/deep universe | Uranometria where LRD/high-z/cosmology layers exist; Universe Atlas fills uncovered context | mixed |
| 10^24–10^22 m | cosmic web / galaxies / Milky Way | Uranometria | Atlas-owned |
| 10^22–10^16 m | Milky Way → stellar neighbourhood | Uranometria | Atlas-owned |
| 10^16–10^13 m | outer stellar/Solar neighbourhood → Solar System | Uranometria; Universe reference only where duplicate | Atlas-owned |
| 10^13–10^8 m | Solar System → Earth | Uranometria; Atlas of Space/MPC small-body data may enrich Uranometria, including NEOs, main belt/families, Trojans, Centaurs, TNOs, scattered/detached objects and notable co-orbitals/quasi-satellites | Atlas-owned/enriched |
| 10^8–10^1 m | Earth → human/macroscopic | Universe Atlas provisional representation until Earth/Atlas specialist layers cover the requested focus | gap-fill |
| 10^1–10^-9 m | human → biological/molecular | Universe Atlas provisional representation except where Tree of Life/Atlas specialist representations exist | mixed/gap-fill |
| ~10^-10 m | atom | Matter Atlas specialist atom/exotic-atom representations take precedence | Matter-owned |
| 10^-11–10^-14 m | nucleus → nucleon | Matter Atlas where implemented; Universe Atlas fills missing visual scale transitions | mixed |
| ~10^-14–10^-16 m | proton interior / quark scale | Matter Atlas Standard Model/QCD is authoritative when available; Universe Atlas provides provisional illustrative scale representation | mixed/gap-fill |

## Largest-scale seam

The Universe Atlas cosmic-scale scene is a contextual scale reference, not the authority for Uranometria's high-redshift observations. Uranometria's LRD catalogue, redshifts, survey provenance and cosmology layers remain observational products. Procedural structure must be visibly distinguished from measured/reconstructed objects.

## Solar-System seam

Do not embed a second Solar-System renderer. Uranometria retains its own astronomical zoom and coordinate/time semantics. Small-body orbital data and useful generation/LOD techniques from Atlas of Space, MPC-derived sources, or Universe Atlas may be normalized into Uranometria.

## Matter seam

Universe Atlas may bridge unimplemented orders of magnitude, but its illustrative subatomic geometry is never promoted to measured structure. Matter Atlas owns Standard Model, QCD/hadrons, nuclei/nuclides, hypernuclei, atoms/exotic atoms, quasiparticles and phases as those domains become available.

## Resolver metadata

Every scale-domain route should eventually expose:
- log10 scale interval in metres
- owner
- renderer/page entry point
- evidence class: observation / reconstruction / physical model / illustrative
- native coordinate frame and origin where applicable
- source/provenance
- supersedes / superseded-by
- mobile LOD/data budget
- handoff targets above and below the interval

## Upstream references

- Universe Atlas — Chris Zaharia (Chris Zetterstrom/chrisjz GitHub identity), https://github.com/chrisjz/universe — MIT; global scale engine and provisional gap representations.
- Atlas of Space — Gordon Hart, fork https://github.com/mardukasoka/atlasof.space — Solar-System/small-body orbital reference and integration source.


## Small-body population contract

Centaurs are a first-class selectable population in the Uranometria Solar-System domain, not folded invisibly into TNOs or a generic asteroid layer.

Default operational taxonomy follows the Minor Planet Center orbit-type classification and records the classifier/source with each derived class. The UI/data model must permit alternate dynamical classifications where definitions differ in the literature.

Minimum population filters for the enrichment pass:
- Atira / Aten / Apollo / Amor and other near-Earth/co-orbital objects
- Mars crossers
- Main belt and useful dynamical families
- Jupiter Trojans
- Jupiter-coupled objects
- Centaurs
- Neptune Trojans
- TNOs, with resonant/classical/scattered/detached subdivisions where supported by the source data
- notable quasi-satellites and other co-orbitals
- long-period / unusual outer-system objects where appropriate

Centaurs occupy the visual/dynamical bridge between the giant-planet region and trans-Neptunian populations. Their rendered identity must remain distinct even where a source groups Centaurs with scattered objects.
