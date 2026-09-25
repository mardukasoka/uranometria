// Uranometria cosmology-layer v0.1
// Normalizes paper/dataset results without confusing observations with models.

export const COSMOLOGY_KINDS = Object.freeze([
  "observation", "catalogue", "reconstruction", "simulation", "inference", "paper_result"
]);

export function assertCosmologyRecord(record) {
  if (!record || typeof record !== "object") throw new TypeError("cosmology record must be an object");
  for (const key of ["id", "domain", "kind", "frame", "provenance", "confidence"]) {
    if (!(key in record)) throw new Error(`missing cosmology field: ${key}`);
  }
  if (!COSMOLOGY_KINDS.includes(record.kind)) throw new Error(`invalid cosmology kind: ${record.kind}`);
  if (!record.frame?.coordinates) throw new Error("cosmology record requires an explicit coordinate frame");
  if (!record.provenance?.source_type || !record.provenance?.citation) {
    throw new Error("cosmology record requires source type and citation");
  }
  return record;
}

export function comparisonKey(record) {
  assertCosmologyRecord(record);
  const z = record.frame.redshift ?? "local";
  return `${record.domain}:${record.frame.coordinates}:${z}`;
}

export function groupComparable(records) {
  return records.reduce((groups, record) => {
    const key = comparisonKey(record);
    (groups[key] ??= []).push(record);
    return groups;
  }, {});
}
