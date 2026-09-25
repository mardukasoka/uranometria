# Uranometria North Star v0.1

## Product ideal
Uranometria is a continuous, evidence-preserving Powers-of-Ten atlas. A user can move without conceptual breaks from particle/atomic scales through life and Earth to the Solar System, stellar neighbourhood, Milky Way, Local Group and observable large-scale structure.

The experience is continuous even when implementation changes renderer, origin, units, dataset, resolution or epistemic representation behind the scenes.

## Three universal operations
### 1. Scale
A logarithmic scale coordinate is global UI state. Zoom changes the scientifically appropriate representation and level of detail, not the identity of the subject.

### 2. Focus
Any selectable entity can become the focus/temporary origin of navigation. Centering an entity does not rewrite its scientific native frame or provenance. Focus state is independent of coordinate-frame selection.

### 3. Time
Time is first-class global state, but its semantics are domain-specific and explicit:
- physical/dynamical time: motion/evolution
- observation epoch: when a measurement applies
- epistemic/history time: what humans knew/represented at a date
- geological/evolutionary time where relevant to Earth/Tree of Life
A layer declares which time modes it supports and its valid interval/resolution. Unsupported extrapolation is never silently invented.

## Persistent identity
Every physical/biological/conceptual entity has a stable Atlas entity identity. It may expose multiple evidence records and multiple scale-dependent visual proxies.

Entity -> evidence/state -> domain representation -> visual proxy

Examples:
Sun: resolved body -> stellar point -> Galactic position -> observer context.
Earth: planet -> geosphere/biosphere -> locality for Tree of Life -> observer platform.
Milky Way: resolved Galactic model -> Local Group member -> observer/selection mask at cosmic scale.

## Renderer domains
No universal metric scene is required. Specialized domains share Scale, Focus, Time, Entity and Evidence state:
- particle/atomic
- molecular/cellular/biological
- Earth/geosphere/biosphere
- Solar System
- stellar neighbourhood
- Milky Way
- Local Group
- Local Universe
- Cosmic Web

Transitions overlap so adjacent representations can cross-fade only where both are valid.

## Resolution-forward contract
Every dataset/visual proxy declares:
- native frame/origin/units
- spatial resolution or uncertainty
- temporal epoch/range/resolution
- evidence class and provenance
- valid scale activation range
- parent/child entity relationships
- version/source release
- replacement/supersession relationship

Higher-resolution future data must be ingestible as a new evidence/representation version without changing stable entity identity or UI navigation contracts.

Never bake scientific resolution into entity identity.

## Accuracy rules
1. Observations, reconstructions, models and inferences remain separable.
2. Missing data remain missing.
3. Uncertainty is representable spatially and temporally.
4. Coordinate/frame changes transform geometry and state, not labels alone.
5. Centering an object changes the camera/navigation origin, not its measured coordinates.
6. Time extrapolation identifies the propagation/model used.
7. LOD simplification may reduce visual resolution but may not manufacture scientific precision.
8. Selection functions/completeness can be displayed where they materially affect interpretation.

## Architectural target
The apparent user experience is one atlas:

Scale + Focus + Time
        |
Persistent Entity/Evidence Graph
        |
Domain/LOD Resolver
        |
Frame/Origin Transform
        |
Domain Renderer + Data Stream

This is the contract linking existing atom models, Tree of Life/Earth layers and Uranometria rather than forcing them into one renderer.
