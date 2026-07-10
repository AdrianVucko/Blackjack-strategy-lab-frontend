import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RunHistory } from "./RunHistory";
import { ApiError } from "@/api/client";
import type { RunSummary } from "@/types/api";

const listRuns = vi.fn();
const getRun = vi.fn();

vi.mock("@/api/endpoints", () => ({
  listRuns: (...args: unknown[]) => listRuns(...args),
  getRun: (...args: unknown[]) => getRun(...args),
}));

const RUNS: RunSummary[] = [
  {
    id: 2,
    created_at: "2026-07-10T18:30:00Z",
    kind: "counting",
    rounds_played: 200_000,
    ruined: false,
    house_edge_pct: -0.1,
    ev_per_round: 0.001,
  },
  {
    id: 1,
    created_at: "2026-07-10T18:00:00Z",
    kind: "basic",
    rounds_played: 100_000,
    ruined: true,
    house_edge_pct: 0.5,
    ev_per_round: -0.005,
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  listRuns.mockResolvedValue(RUNS);
});

describe("RunHistory", () => {
  it("renders a row per run", async () => {
    render(<RunHistory />);
    await waitFor(() => expect(screen.getByText("#2")).toBeInTheDocument());
    expect(screen.getByText("#1")).toBeInTheDocument();
    expect(screen.getByText("ruined")).toBeInTheDocument();
    expect(listRuns).toHaveBeenCalledWith(20, expect.anything());
  });

  it("shows an empty state when there are no runs", async () => {
    listRuns.mockResolvedValueOnce([]);
    render(<RunHistory />);
    await waitFor(() =>
      expect(screen.getByText(/no runs yet/i)).toBeInTheDocument(),
    );
  });

  it("reports a friendly message on a 404 lookup", async () => {
    getRun.mockRejectedValue(new ApiError(404, "Request failed with status 404"));
    const user = userEvent.setup();
    render(<RunHistory />);

    await user.type(screen.getByLabelText("Run ID"), "999");
    await user.click(screen.getByRole("button", { name: /look up/i }));

    await waitFor(() =>
      expect(screen.getByText(/no run found with id 999/i)).toBeInTheDocument(),
    );
  });

  it("shows the run summary on a successful lookup", async () => {
    getRun.mockResolvedValue(RUNS[0]);
    const user = userEvent.setup();
    render(<RunHistory />);

    await user.type(screen.getByLabelText("Run ID"), "2");
    await user.click(screen.getByRole("button", { name: /look up/i }));

    await waitFor(() => expect(getRun).toHaveBeenCalledWith(2, expect.anything()));
    expect(screen.getByText("200,000 rounds")).toBeInTheDocument();
  });
});
