import { describe, expect, it } from "vitest";
import { countKind, tiersToRamp, RAMP_FLOOR } from "./counting";

describe("tiersToRamp", () => {
  it("serializes to [count, units] pairs sorted ascending by count", () => {
    const ramp = tiersToRamp([
      { count: 4, units: 8 },
      { count: RAMP_FLOOR, units: 1 },
      { count: 2, units: 2 },
    ]);
    expect(ramp).toEqual([
      [RAMP_FLOOR, 1],
      [2, 2],
      [4, 8],
    ]);
  });
});

describe("countKind", () => {
  it("uses running count for the unbalanced KO system", () => {
    expect(countKind("KO")).toBe("running count");
  });

  it("uses true count for balanced systems", () => {
    expect(countKind("Hi-Lo")).toBe("true count");
    expect(countKind("Hi-Opt I")).toBe("true count");
  });
});
