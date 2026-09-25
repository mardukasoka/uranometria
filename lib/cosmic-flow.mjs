// Lightweight contracts for Uranometria's multi-dipole / multi-scale flow view.
import { assertCosmologyRecord } from "./cosmology.mjs";

export function assertVector3(v, label = "vector") {
  if (!Array.isArray(v) || v.length !== 3 || v.some(n => !Number.isFinite(n))) throw new Error(`${label} must be a finite [x,y,z] vector`);
  return v;
}

export function assertDipole(record) {
  assertCosmologyRecord(record);
  if (record.domain !== "dipoles") throw new Error("dipole record must use domain=dipoles");
  assertVector3(record.observable?.vector, "dipole vector");
  if (!record.observable?.units) throw new Error("dipole amplitude must retain native units");
  return record;
}

export function assertFlowSample(record) {
  assertCosmologyRecord(record);
  if (!["bulk_flow","cosmic_web"].includes(record.domain)) throw new Error("flow sample must use bulk_flow or cosmic_web domain");
  assertVector3(record.observable?.position, "flow position");
  assertVector3(record.observable?.velocity, "flow velocity");
  return record;
}

export function shellForDistance(distanceMpcH, shells = [50,100,200,300]) {
  if (!Number.isFinite(distanceMpcH) || distanceMpcH < 0) throw new Error("distance must be non-negative");
  return shells.find(limit => distanceMpcH <= limit) ?? "external";
}

export function splitByEvidence(records) {
  const out = { measured: [], reconstructed: [], inferred: [], simulated: [] };
  for (const record of records) {
    assertCosmologyRecord(record);
    if (["observation","catalogue"].includes(record.kind)) out.measured.push(record);
    else if (record.kind === "reconstruction") out.reconstructed.push(record);
    else if (record.kind === "simulation") out.simulated.push(record);
    else out.inferred.push(record);
  }
  return out;
}
