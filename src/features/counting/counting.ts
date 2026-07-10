import type { CountingSystem } from "@/types/api";

export const COUNTING_SYSTEMS: readonly CountingSystem[] = [
  "Hi-Lo",
  "KO",
  "Hi-Opt I",
] as const;

// JSON has no -Infinity; the backend uses a very negative floor (handoff §4).
export const RAMP_FLOOR = -999;

export interface RampTier {
  count: number;
  units: number;
}

// Classic 1–12 Hi-Lo spread; first tier is the floor.
export const DEFAULT_RAMP: RampTier[] = [
  { count: RAMP_FLOOR, units: 1 },
  { count: 2, units: 2 },
  { count: 3, units: 4 },
  { count: 4, units: 8 },
  { count: 5, units: 12 },
];

/** Serialize editor tiers to the `[[count, units], ...]` wire format, sorted ascending. */
export function tiersToRamp(tiers: RampTier[]): [number, number][] {
  return [...tiers]
    .sort((a, b) => a.count - b.count)
    .map((t) => [t.count, t.units]);
}

/** Balanced systems index on the true count; KO is unbalanced and uses the running count. */
export function countKind(system: CountingSystem): "true count" | "running count" {
  return system === "KO" ? "running count" : "true count";
}
