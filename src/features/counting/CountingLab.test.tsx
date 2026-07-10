import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CountingLab } from "./CountingLab";
import { RulesProvider } from "@/state/rules-context";
import type { CountingResponse } from "@/types/api";

const runCounting = vi.fn();
const edgeCurve = vi.fn();
const trueCountDistribution = vi.fn();

vi.mock("@/api/endpoints", () => ({
  runCounting: (...args: unknown[]) => runCounting(...args),
  viz: {
    edgeCurve: (...args: unknown[]) => edgeCurve(...args),
    trueCountDistribution: (...args: unknown[]) =>
      trueCountDistribution(...args),
  },
}));

vi.mock("@/components/ChartPanel", () => ({
  ChartPanel: ({ title }: { title: string }) => <div>{title}</div>,
}));

const RESPONSE: CountingResponse = {
  run_id: 2,
  kind: "counting",
  rounds_played: 200_000,
  ruined: false,
  average_bet: 2.6,
  statistics: {
    rounds: 200_000,
    ev_per_round: 0.001,
    house_edge_pct: -0.1,
    variance: 8.5,
    std_dev: 2.9,
    std_error: 0.006,
    ci95: [-0.011, 0.013],
    total_result: 200,
    risk_of_ruin: null,
  },
  bankroll_curve: [0, 10, 5],
};

const FIGURE = { data: [], layout: {} };

beforeEach(() => {
  vi.clearAllMocks();
  runCounting.mockResolvedValue(RESPONSE);
  edgeCurve.mockResolvedValue(FIGURE);
  trueCountDistribution.mockResolvedValue(FIGURE);
});

function setup() {
  return render(
    <RulesProvider>
      <CountingLab />
    </RulesProvider>,
  );
}

describe("CountingLab", () => {
  it("runs and shows the average bet and edge-curve panel", async () => {
    const user = userEvent.setup();
    setup();

    await user.click(
      screen.getByRole("button", { name: /run counting simulation/i }),
    );

    await waitFor(() =>
      expect(screen.getByText("Average bet")).toBeInTheDocument(),
    );
    expect(screen.getByText("Player edge by true count")).toBeInTheDocument();
    expect(screen.getByText("True-count distribution")).toBeInTheDocument();
    // risk_of_ruin is null → no card
    expect(screen.queryByText("Risk of ruin")).not.toBeInTheDocument();
  });

  it("sends system + base_bet and null ramp_tiers by default", async () => {
    const user = userEvent.setup();
    setup();

    await user.click(
      screen.getByRole("button", { name: /run counting simulation/i }),
    );

    await waitFor(() => expect(runCounting).toHaveBeenCalled());
    const request = runCounting.mock.calls[0]![0];
    expect(request.system).toBe("Hi-Lo");
    expect(request.base_bet).toBe(10);
    expect(request.ramp_tiers).toBeNull();
  });

  it("serializes the custom ramp with the floor tier first", async () => {
    const user = userEvent.setup();
    setup();

    await user.click(screen.getByRole("switch", { name: /custom bet ramp/i }));
    await user.click(
      screen.getByRole("button", { name: /run counting simulation/i }),
    );

    await waitFor(() => expect(runCounting).toHaveBeenCalled());
    const request = runCounting.mock.calls[0]![0];
    expect(request.ramp_tiers[0]).toEqual([-999, 1]);
    expect(request.ramp_tiers).toHaveLength(5);
  });
});
