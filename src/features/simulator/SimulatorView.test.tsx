import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SimulatorView } from "./SimulatorView";
import { RulesProvider } from "@/state/rules-context";
import type { SimulationResponse } from "@/types/api";

const runSimulation = vi.fn();
const bankroll = vi.fn();
const resultDistribution = vi.fn();

vi.mock("@/api/endpoints", () => ({
  runSimulation: (...args: unknown[]) => runSimulation(...args),
  viz: {
    bankroll: (...args: unknown[]) => bankroll(...args),
    resultDistribution: (...args: unknown[]) => resultDistribution(...args),
  },
}));

// Avoid loading Plotly in jsdom.
vi.mock("@/components/ChartPanel", () => ({
  ChartPanel: ({ title }: { title: string }) => <div>{title}</div>,
}));

const RESPONSE: SimulationResponse = {
  run_id: 1,
  kind: "basic",
  rounds_played: 100_000,
  ruined: false,
  statistics: {
    rounds: 100_000,
    ev_per_round: -0.005,
    house_edge_pct: 0.5,
    variance: 1.33,
    std_dev: 1.154,
    std_error: 0.0036,
    ci95: [-0.012, 0.002],
    total_result: -500,
    risk_of_ruin: 0.42,
  },
  bankroll_curve: [1000, 995, 1002.5],
};

const FIGURE = { data: [], layout: {} };

beforeEach(() => {
  vi.clearAllMocks();
  runSimulation.mockResolvedValue(RESPONSE);
  bankroll.mockResolvedValue(FIGURE);
  resultDistribution.mockResolvedValue(FIGURE);
});

function setup() {
  return render(
    <RulesProvider>
      <SimulatorView />
    </RulesProvider>,
  );
}

describe("SimulatorView", () => {
  it("runs a simulation and renders stat cards", async () => {
    const user = userEvent.setup();
    setup();

    await user.click(screen.getByRole("button", { name: /run simulation/i }));

    await waitFor(() =>
      expect(screen.getByText("House edge")).toBeInTheDocument(),
    );
    expect(screen.getByText("0.50%")).toBeInTheDocument();
    expect(screen.getByText("Risk of ruin")).toBeInTheDocument();
    expect(screen.getByText("Bankroll / equity")).toBeInTheDocument();
    expect(screen.getByText("Per-round result distribution")).toBeInTheDocument();
  });

  it("sends the shared rules and resolved optional params in the request", async () => {
    const user = userEvent.setup();
    setup();

    await user.click(screen.getByRole("button", { name: /run simulation/i }));

    await waitFor(() => expect(runSimulation).toHaveBeenCalled());
    const request = runSimulation.mock.calls[0]![0];
    expect(request.num_rounds).toBe(100_000);
    expect(request.rules.num_decks).toBe(6);
    expect(request.starting_bankroll).toBe(1000);
    expect(request.seed).toBe(2024);
  });

  it("omits bankroll and seed when their toggles are off", async () => {
    const user = userEvent.setup();
    setup();

    await user.click(screen.getByRole("switch", { name: /track bankroll/i }));
    await user.click(
      screen.getByRole("switch", { name: /reproducible/i }),
    );
    await user.click(screen.getByRole("button", { name: /run simulation/i }));

    await waitFor(() => expect(runSimulation).toHaveBeenCalled());
    const request = runSimulation.mock.calls[0]![0];
    expect(request.starting_bankroll).toBeNull();
    expect(request.seed).toBeNull();
  });
});
