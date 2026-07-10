import { UPCARDS, type Action, type ChartRow } from "@/types/api";
import type { StrategyChartResponse } from "@/types/api";

export interface GridRow {
  label: string;
  actions: ChartRow;
  /** true when the row is not part of the returned chart but implied by the rules. */
  implicit?: boolean;
  /** short explanation shown as a footnote-style hint. */
  note?: string;
}

export type StrategyTab = "hard" | "soft" | "pairs";

function uniformRow(action: Action): ChartRow {
  return Object.fromEntries(UPCARDS.map((u) => [u, action])) as ChartRow;
}

/**
 * Hard totals. The chart only carries totals 8..17; totals <=7 are always hit
 * and >=18 always stand (handoff §4), so we synthesize those rows for a full grid.
 */
export function buildHardRows(chart: StrategyChartResponse["chart"]): GridRow[] {
  const rows: GridRow[] = [];

  for (let total = 5; total <= 7; total++) {
    rows.push({
      label: String(total),
      actions: uniformRow("hit"),
      implicit: true,
    });
  }

  for (let total = 8; total <= 17; total++) {
    const row = chart.hard[String(total)];
    if (row) rows.push({ label: String(total), actions: row });
  }

  for (let total = 18; total <= 20; total++) {
    rows.push({
      label: String(total),
      actions: uniformRow("stand"),
      implicit: true,
    });
  }

  return rows;
}

/** Soft hands A,2 .. A,9 in ascending order. */
export function buildSoftRows(chart: StrategyChartResponse["chart"]): GridRow[] {
  const rows: GridRow[] = [];
  for (let n = 2; n <= 9; n++) {
    const key = `A,${n}`;
    const row = chart.soft[key];
    if (row) rows.push({ label: key, actions: row });
  }
  return rows;
}

const PAIR_ORDER = [
  "A,A",
  "10,10",
  "9,9",
  "8,8",
  "7,7",
  "6,6",
  "5,5",
  "4,4",
  "3,3",
  "2,2",
] as const;

/**
 * Pairs in descending order. There is no `5,5` in the chart — a pair of fives
 * is played as a hard 10, so we reuse the hard-10 row (handoff §4).
 */
export function buildPairRows(chart: StrategyChartResponse["chart"]): GridRow[] {
  const rows: GridRow[] = [];
  for (const key of PAIR_ORDER) {
    if (key === "5,5") {
      const hard10 = chart.hard["10"];
      if (hard10) {
        rows.push({
          label: "5,5",
          actions: hard10,
          note: "plays as hard 10",
        });
      }
      continue;
    }
    const row = chart.pairs[key];
    if (row) rows.push({ label: key, actions: row });
  }
  return rows;
}

export function buildRows(
  chart: StrategyChartResponse["chart"],
  tab: StrategyTab,
): GridRow[] {
  switch (tab) {
    case "hard":
      return buildHardRows(chart);
    case "soft":
      return buildSoftRows(chart);
    case "pairs":
      return buildPairRows(chart);
  }
}

export const ACTION_LABELS: Record<Action, string> = {
  hit: "Hit",
  stand: "Stand",
  double: "Double",
  split: "Split",
  surrender: "Surrender",
};

export const ACTION_ABBR: Record<Action, string> = {
  hit: "H",
  stand: "S",
  double: "D",
  split: "P",
  surrender: "R",
};

export const ACTION_BG: Record<Action, string> = {
  hit: "bg-hit",
  stand: "bg-stand",
  double: "bg-double",
  split: "bg-split",
  surrender: "bg-surrender",
};
