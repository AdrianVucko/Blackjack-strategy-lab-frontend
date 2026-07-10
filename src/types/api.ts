// Contract types — see docs/frontend-handoff.md §7.

export type Action = "hit" | "stand" | "double" | "split" | "surrender";
export type CountingSystem = "Hi-Lo" | "KO" | "Hi-Opt I";

export interface Rules {
  num_decks: number;
  dealer_hits_soft_17: boolean;
  blackjack_payout: number;
  double_allowed: boolean;
  double_after_split: boolean;
  resplit_allowed: boolean;
  max_splits: number;
  surrender_allowed: boolean;
  penetration: number;
}

export interface SimulationRequest {
  num_rounds: number;
  rules?: Partial<Rules>;
  bet?: number;
  starting_bankroll?: number | null;
  seed?: number | null;
  max_curve_points?: number;
}

export interface CountingRequest extends SimulationRequest {
  system?: CountingSystem;
  base_bet?: number;
  ramp_tiers?: [number, number][] | null;
}

export interface Statistics {
  rounds: number;
  ev_per_round: number;
  house_edge_pct: number;
  variance: number;
  std_dev: number;
  std_error: number;
  ci95: [number, number];
  total_result: number;
  risk_of_ruin: number | null;
}

export interface SimulationResponse {
  run_id: number;
  kind: "basic" | "counting";
  rounds_played: number;
  ruined: boolean;
  statistics: Statistics;
  bankroll_curve: number[];
}

export interface CountingResponse extends SimulationResponse {
  average_bet: number;
}

export type UpcardKey =
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "A";
export type ChartRow = Record<UpcardKey, Action>;

export interface StrategyChartResponse {
  rules: Rules;
  chart: {
    hard: Record<string, ChartRow>;
    soft: Record<string, ChartRow>;
    pairs: Record<string, ChartRow>;
  };
}

export interface RunSummary {
  id: number;
  created_at: string;
  kind: "basic" | "counting";
  rounds_played: number;
  ruined: boolean;
  house_edge_pct: number;
  ev_per_round: number;
}

// Plotly figures come back as { data: any[]; layout: Record<string, unknown> }
export interface PlotlyFigure {
  data: unknown[];
  layout: Record<string, unknown>;
}

export const UPCARDS: readonly UpcardKey[] = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "A",
] as const;
