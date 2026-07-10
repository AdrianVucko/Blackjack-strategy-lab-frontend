import type { Rules } from "@/types/api";

// Defaults mirror the backend Rules model (handoff §4).
export const DEFAULT_RULES: Rules = {
  num_decks: 6,
  dealer_hits_soft_17: true,
  blackjack_payout: 1.5,
  double_allowed: true,
  double_after_split: true,
  resplit_allowed: true,
  max_splits: 3,
  surrender_allowed: false,
  penetration: 0.75,
};

// The /strategy/chart endpoint takes rule fields as query params (handoff §5).
export function rulesToQuery(rules: Rules): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(rules)) {
    params.set(key, String(value));
  }
  return params;
}
