import { describe, expect, it } from "vitest";
import { UPCARDS, type Action, type ChartRow } from "@/types/api";
import type { StrategyChartResponse } from "@/types/api";
import { buildHardRows, buildPairRows, buildSoftRows } from "./strategy-grid";

function row(action: Action): ChartRow {
  return Object.fromEntries(UPCARDS.map((u) => [u, action])) as ChartRow;
}

const chart: StrategyChartResponse["chart"] = {
  hard: {
    "8": row("hit"),
    "9": row("double"),
    "10": row("double"),
    "11": row("double"),
    "12": row("stand"),
    "13": row("stand"),
    "14": row("stand"),
    "15": row("stand"),
    "16": row("stand"),
    "17": row("stand"),
  },
  soft: {
    "A,2": row("hit"),
    "A,7": row("stand"),
    "A,9": row("stand"),
  },
  pairs: {
    "A,A": row("split"),
    "8,8": row("split"),
    "10,10": row("stand"),
  },
};

describe("buildHardRows", () => {
  it("synthesizes implicit hit rows for totals <=7", () => {
    const rows = buildHardRows(chart);
    const low = rows.filter((r) => ["5", "6", "7"].includes(r.label));
    expect(low).toHaveLength(3);
    for (const r of low) {
      expect(r.implicit).toBe(true);
      expect(r.actions["2"]).toBe("hit");
      expect(r.actions["A"]).toBe("hit");
    }
  });

  it("synthesizes implicit stand rows for totals >=18", () => {
    const rows = buildHardRows(chart);
    const high = rows.filter((r) => ["18", "19", "20"].includes(r.label));
    expect(high).toHaveLength(3);
    for (const r of high) {
      expect(r.implicit).toBe(true);
      expect(r.actions["10"]).toBe("stand");
    }
  });

  it("passes through returned decision rows unchanged", () => {
    const rows = buildHardRows(chart);
    const eleven = rows.find((r) => r.label === "11");
    expect(eleven?.implicit).toBeUndefined();
    expect(eleven?.actions["6"]).toBe("double");
  });

  it("orders rows ascending 5..20", () => {
    const labels = buildHardRows(chart).map((r) => r.label);
    expect(labels).toEqual([
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12",
      "13",
      "14",
      "15",
      "16",
      "17",
      "18",
      "19",
      "20",
    ]);
  });
});

describe("buildSoftRows", () => {
  it("includes only the soft hands present in the chart, ascending", () => {
    const labels = buildSoftRows(chart).map((r) => r.label);
    expect(labels).toEqual(["A,2", "A,7", "A,9"]);
  });
});

describe("buildPairRows", () => {
  it("maps 5,5 to the hard-10 row with a note", () => {
    const rows = buildPairRows(chart);
    const fives = rows.find((r) => r.label === "5,5");
    expect(fives).toBeDefined();
    expect(fives?.note).toContain("hard 10");
    expect(fives?.actions["6"]).toBe("double"); // same as hard["10"]
  });

  it("keeps descending order and never emits a 5,5 from chart.pairs", () => {
    const labels = buildPairRows(chart).map((r) => r.label);
    expect(labels).toEqual(["A,A", "10,10", "8,8", "5,5"]);
    // 5,5 sits between 6,6 and 4,4 in canonical order → after 8,8 here.
    expect(labels.indexOf("5,5")).toBeGreaterThan(labels.indexOf("8,8"));
  });
});
