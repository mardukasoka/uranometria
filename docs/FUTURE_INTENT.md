# Uranometria — Future Intent

## Atlas Steward / local accuracy agent

**Status:** future intent only; not part of the current Solar-System render pass.

Host a small local/on-device language model (candidate class: Liquid LFM or similarly compact model) as an **Atlas Steward** inside the bounded recursive-improvement architecture.

The Steward is not a scientific authority. Its role is to audit and propose:
- stale or missing provenance;
- contradictory catalogue records;
- schema violations and missing fields;
- coordinate/frame inconsistencies;
- unsupported or overconfident claims;
- likely classification errors;
- links between new observations and existing Atlas entities.

Proposed corrections must remain evidence-bearing and pass deterministic validation plus the existing governed review/evaluation path before promotion.

Candidate evaluation metrics:
- false-positive rate;
- missed known inconsistencies;
- provenance completeness;
- coordinate/classification accuracy;
- regression rate;
- runtime, memory and token cost.

Do not fine-tune the first version on unverified Atlas assertions. Prefer source-backed evaluation sets and known-error fixtures so the Steward cannot become a circular source of truth.

### Intended flow

authoritative sources
→ deterministic validators
→ Atlas Steward
→ bounded R1 evaluation
→ council/human review where required
→ accepted evidence graph

This intent must not alter or block current Uranometria rendering work.
