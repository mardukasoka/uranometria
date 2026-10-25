# Atlas theory comparison registry — Pass 1
Status: **provisional reference dataset**. This is a comparison of research programmes, not an endorsement or claim of equivalence.

## Epistemic status vocabulary
- **Established empirical framework**: strong observational or experimental corroboration within stated domain.
- **Empirically constrained alternative**: explicit observational tests and known limitations.
- **Research programme**: active mathematical development, with some tests or model-dependent predictions; no confirmed complete empirical replacement.
- **Speculative candidate**: foundational proposal whose central physical identifications remain unverified.
- **Formal result**: theorem relative to stated axioms; does not independently validate physical interpretation.

Always store *claim-level* status separately from *theory-level* status. A formal proof is not an empirical measurement. Record source, date, version, assumptions, uncertainties, and outstanding falsification tests.

| Framework | Domain / question | Status | Evidence and limitations |
|---|---|---|---|
| Standard Model | Electroweak and strong interactions | Established empirical framework | Precision particle physics; does not incorporate quantum gravity or explain all parameters |
| General Relativity | Classical gravitation | Established empirical framework | Extensive gravitational tests; quantum regime unresolved |
| ΛCDM | Large-scale cosmology | Established empirical framework | Fits many cosmological observations; dark sector nature and tensions remain open |
| MOND / relativistic extensions | Galaxy dynamics / alternative gravity | Empirically constrained alternative | Galaxy-scale phenomenology; cluster and cosmological constraints depend on formulation |
| String / M-theory | Quantum gravity and unification | Research programme | Rich mathematical structure; no uniquely verified low-energy realization |
| Loop quantum gravity | Quantum spacetime | Research programme | Nonperturbative constructions; recovering all observed physics remains challenging |
| Causal set theory | Discrete spacetime | Research programme | Discreteness and causal order; observational discrimination unresolved |
| Chain Theory | Quantum-information-based unification | Speculative candidate | Author's proposed link-sector identifications and fine-structure constant conjecture are not experimentally established |

## Chain Theory: claim decomposition
- **Mathematical claim**: formalized algebraic expression for a candidate dimensionless number, subject to the definitions and assumptions in the Lean file.
- **Physical conjecture**: identification of that number with the low-energy fine-structure constant α(0).
- **Proposed sector map**: (2,2) spacetime; (3,2) electromagnetic; (3,3) strong; (4,2) weak; (4,3) Yukawa; (4,4) Higgs.
- **Verification pending**: reproduce Lean build with pinned toolchain, inspect hypotheses and dependencies, independently assess physical derivations and discriminating predictions.
- **Do not infer**: machine-checking of an algebraic identity establishes the physical theory.

## Primary references
- Chain Theory compendium: https://alexwg.org/publications/ChainTheoryCompendium.pdf
- Chain Theory Lean source: https://alexwg.org/publications/ChainAlpha.lean
- Chain Theory slides: https://alexwg.org/publications/ChainTheoryTalk.pdf
- Standard Model overview: https://home.cern/science/physics/standard-model
- Planck 2018 cosmological parameters: https://arxiv.org/abs/1807.06209
- MOND foundational paper: https://ui.adsabs.harvard.edu/abs/1983ApJ...270..365M/abstract
- String theory review entry: https://plato.stanford.edu/entries/string-theory/
- Loop quantum gravity review: https://arxiv.org/abs/gr-qc/9710008
- Causal sets review: https://arxiv.org/abs/gr-qc/0309009

## Next acceptance gates
1. Verify all source links, versions and exact theory claims.
2. Transform this registry into machine-readable claim-level records with stable identifiers.
3. Render a mobile comparison page with source and uncertainty drawer.
4. Run link and scientific-content review before public deployment.

**Boundary:** Cosmological models and fundamental unification theories answer overlapping but distinct questions; rows are not one-to-one competitors.
