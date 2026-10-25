# Indigo Engineering Council — bounded verification protocol v0.1

This document defines a **supervised** maintenance procedure. It does not authorize autonomous merges, deployments, or recursive code changes.

## Roles and separation of duties
1. **Implementer** proposes a small scoped PR with a testable defect or claim and explicit rollback.
2. **Automated verifier** records exact head SHA, positive and negative tests, CI job URLs, security checks and reproducible failure evidence.
3. **Independent reviewer** (different agent or human) reads the actual diff and test logs. A second model's agreement without independent inspection is not approval.
4. **Domain reviewer** validates scientific evidence, licensing, privacy or physical/mobile behavior where applicable.
5. **Human release authority** alone decides PR approval, merge and public deployment.

## Evidence ledger contract
Each entry records: repository, PR, full SHA, test name, workflow URL, status, observation timestamp, reviewer identity, review method, outstanding issue, acceptance scope and human decision. A green result on an old SHA is **stale** when the head changes. A successful CI result does not imply correct science or usable Android UI.

## Epistemic labels
- **Observed**: directly verified artifact, output or measurement with reproducible reference.
- **Inferred**: conclusion derived from observed evidence; assumptions explicit.
- **Proposed**: untested change or future action.
- **Unverified**: missing reproducible evidence.
- **Rejected**: contradicted by checks or independent review.

Never silently promote an inference or proposal to observed. Never treat mathematical formalization as empirical validation.

## Release gates
- **Code review:** independent inspection, bounded scope, passing SHA-tied CI, reproducible negative case when appropriate.
- **Science review:** claim-by-claim primary sources, uncertainties, competing interpretations, and human domain sign-off.
- **Device review:** physical Android/browser checks for touch, navigation, reload and accessibility.
- **Deployment:** separate explicit human authorization and post-release rollback/monitoring plan.

## Current four-PR handoff (26 October 2026)
| PR | Head at handoff | Automated evidence | Outstanding |
| --- | --- | --- | --- |
| Chess #86 | `ca2333083000eee9fa857d0d4c4612a3ba84af95` | https://github.com/mardukasoka/chess-atlas/actions/runs/40207783359 | Independent diff/log review; Android before deployment |
| Nuclides #2 | `9f9a364e83ec126e11cdb1ebb87a1147e74d9061` | https://github.com/mardukasoka/galaxy_of_nuclides/actions/runs/40206211185 | Scaffolding-only review; placeholder display gate |
| God's Eye #3 | `10afaa121684fbdd59bc53acc83553ef589c6744` | https://github.com/mardukasoka/gods-eye-view/actions/runs/40207413726 | Adapter-only review; live feed/CORS and UI separate |
| Uranometria #8 | `5651f496eb446fefe37211febce7bf2bfb16ae69` | https://github.com/mardukasoka/uranometria/actions/runs/40206274498 | Independent scientific review and mutation verification |

**No PR listed above is approved, merged or deployed by this record.**
