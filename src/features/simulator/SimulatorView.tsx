import { useState } from "react";
import { ChartPanel } from "@/components/ChartPanel";
import { NumberField, Toggle } from "@/components/ui/controls";
import { StatCard } from "@/components/ui/StatCard";
import { runSimulation, viz } from "@/api/endpoints";
import { useAction } from "@/hooks/use-action";
import { formatInt, formatPct, formatSigned, formatUnits } from "@/lib/format";
import { useRules } from "@/state/rules-context";
import type {
  PlotlyFigure,
  SimulationRequest,
  SimulationResponse,
  Statistics,
} from "@/types/api";

interface SimParams {
  num_rounds: number;
  bet: number;
  trackBankroll: boolean;
  starting_bankroll: number;
  reproducible: boolean;
  seed: number;
  max_curve_points: number;
}

const DEFAULT_PARAMS: SimParams = {
  num_rounds: 100_000,
  bet: 1,
  trackBankroll: true,
  starting_bankroll: 1000,
  reproducible: true,
  seed: 2024,
  max_curve_points: 500,
};

const ROUND_PRESETS = [10_000, 100_000, 1_000_000];

interface SimResult {
  sim: SimulationResponse;
  bankroll: PlotlyFigure;
  distribution: PlotlyFigure;
}

export function SimulatorView() {
  const { rules } = useRules();
  const [params, setParams] = useState<SimParams>(DEFAULT_PARAMS);
  const { state, run } = useAction<SimResult>();

  const update = <K extends keyof SimParams>(key: K, value: SimParams[K]) =>
    setParams((prev) => ({ ...prev, [key]: value }));

  const buildRequest = (): SimulationRequest => ({
    num_rounds: params.num_rounds,
    rules,
    bet: params.bet,
    starting_bankroll: params.trackBankroll ? params.starting_bankroll : null,
    seed: params.reproducible ? params.seed : null,
    max_curve_points: params.max_curve_points,
  });

  const handleRun = () => {
    const request = buildRequest();
    void run(async (signal) => {
      const [sim, bankroll, distribution] = await Promise.all([
        runSimulation(request, signal),
        viz.bankroll(request, signal),
        viz.resultDistribution(request, signal),
      ]);
      return { sim, bankroll, distribution };
    });
  };

  const running = state.status === "loading";

  return (
    <section className="flex flex-col gap-5">
      <header className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-slate-100">Simulator</h2>
        <p className="text-xs text-slate-400">
          Monte-Carlo simulation of basic strategy under the current rules. Bets
          and results are in base-bet units.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2 sm:col-span-2">
          <NumberField
            id="num_rounds"
            label="Rounds"
            hint="1 – 5,000,000. Large runs take a few seconds."
            value={params.num_rounds}
            min={1}
            max={5_000_000}
            step={1000}
            onChange={(v) => update("num_rounds", v)}
          />
          <div className="flex gap-2">
            {ROUND_PRESETS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => update("num_rounds", n)}
                className={`rounded-md border px-2 py-1 text-xs ${
                  params.num_rounds === n
                    ? "border-emerald-500 bg-emerald-600/20 text-emerald-300"
                    : "border-slate-600 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {formatInt(n)}
              </button>
            ))}
          </div>
        </div>

        <NumberField
          id="bet"
          label="Bet (units)"
          value={params.bet}
          min={0.01}
          step={1}
          onChange={(v) => update("bet", v)}
        />
        <NumberField
          id="max_curve_points"
          label="Curve resolution"
          hint="2 – 5000 plotted points"
          value={params.max_curve_points}
          min={2}
          max={5000}
          step={50}
          onChange={(v) => update("max_curve_points", v)}
        />
      </div>

      <div className="flex flex-col divide-y divide-slate-700/60 rounded-lg border border-slate-700/60 bg-slate-800/40 px-4 py-1">
        <Toggle
          label="Track bankroll"
          hint="Enables the risk-of-ruin estimate"
          checked={params.trackBankroll}
          onChange={(v) => update("trackBankroll", v)}
        />
        {params.trackBankroll && (
          <div className="py-2">
            <NumberField
              id="starting_bankroll"
              label="Starting bankroll"
              value={params.starting_bankroll}
              min={1}
              step={100}
              onChange={(v) => update("starting_bankroll", v)}
            />
          </div>
        )}
        <Toggle
          label="Reproducible (fixed seed)"
          hint="Same seed + request → identical results"
          checked={params.reproducible}
          onChange={(v) => update("reproducible", v)}
        />
        {params.reproducible && (
          <div className="py-2">
            <NumberField
              id="seed"
              label="Seed"
              value={params.seed}
              min={0}
              step={1}
              onChange={(v) => update("seed", v)}
            />
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleRun}
        disabled={running}
        className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {running ? "Running simulation…" : "Run simulation"}
      </button>

      {state.status === "error" && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
          <p className="font-medium">Simulation failed.</p>
          <p className="mt-1 text-red-300/80">{state.error.message}</p>
        </div>
      )}

      {running && (
        <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-8 text-center text-sm text-slate-400">
          Simulating {formatInt(params.num_rounds)} rounds…
        </div>
      )}

      {state.status === "success" && <Results result={state.data} />}
    </section>
  );
}

function Results({ result }: { result: SimResult }) {
  const { sim, bankroll, distribution } = result;
  const stats = sim.statistics;

  return (
    <div className="flex flex-col gap-5">
      <StatGrid sim={sim} stats={stats} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartPanel
          title="Bankroll / equity"
          description="Cumulative result over rounds (downsampled)."
          figure={bankroll}
        />
        <ChartPanel
          title="Per-round result distribution"
          description="Histogram of net outcomes per round."
          figure={distribution}
        />
      </div>
    </div>
  );
}

function StatGrid({
  sim,
  stats,
}: {
  sim: SimulationResponse;
  stats: Statistics;
}) {
  const edgeTone = stats.house_edge_pct > 0 ? "bad" : "good";

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      <StatCard
        label="House edge"
        value={formatPct(stats.house_edge_pct)}
        tone={edgeTone}
        hint="Positive = house advantage"
      />
      <StatCard
        label="EV / round"
        value={formatSigned(stats.ev_per_round)}
        tone={stats.ev_per_round >= 0 ? "good" : "bad"}
        hint={`95% CI [${stats.ci95[0].toFixed(3)}, ${stats.ci95[1].toFixed(3)}]`}
      />
      <StatCard
        label="Total result"
        value={formatUnits(stats.total_result, 1)}
        tone={stats.total_result >= 0 ? "good" : "bad"}
      />
      <StatCard label="Std. deviation" value={stats.std_dev.toFixed(3)} />
      <StatCard
        label="Rounds played"
        value={formatInt(sim.rounds_played)}
        hint={sim.ruined ? "ended early — bankroll ruined" : undefined}
        tone={sim.ruined ? "bad" : "neutral"}
      />
      {stats.risk_of_ruin !== null && (
        <StatCard
          label="Risk of ruin"
          value={formatPct(stats.risk_of_ruin * 100, 1)}
          tone={stats.risk_of_ruin > 0.5 ? "bad" : "neutral"}
        />
      )}
      <StatCard label="Variance" value={stats.variance.toFixed(3)} />
      <StatCard label="Std. error" value={stats.std_error.toFixed(4)} />
    </div>
  );
}
