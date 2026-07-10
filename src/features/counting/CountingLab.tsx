import { useState } from "react";
import { ChartPanel } from "@/components/ChartPanel";
import { NumberField, SelectField, Toggle } from "@/components/ui/controls";
import { StatCard } from "@/components/ui/StatCard";
import { runCounting, viz } from "@/api/endpoints";
import { useAction } from "@/hooks/use-action";
import { formatInt, formatPct, formatSigned, formatUnits } from "@/lib/format";
import { useRules } from "@/state/rules-context";
import type {
  CountingRequest,
  CountingResponse,
  CountingSystem,
  PlotlyFigure,
} from "@/types/api";
import {
  COUNTING_SYSTEMS,
  DEFAULT_RAMP,
  countKind,
  tiersToRamp,
  type RampTier,
} from "./counting";
import { RampEditor } from "./RampEditor";

interface CountingParams {
  num_rounds: number;
  system: CountingSystem;
  base_bet: number;
  reproducible: boolean;
  seed: number;
  trackBankroll: boolean;
  starting_bankroll: number;
  customRamp: boolean;
  tiers: RampTier[];
}

const DEFAULT_PARAMS: CountingParams = {
  num_rounds: 200_000,
  system: "Hi-Lo",
  base_bet: 10,
  reproducible: true,
  seed: 7,
  trackBankroll: false,
  starting_bankroll: 5000,
  customRamp: false,
  tiers: DEFAULT_RAMP,
};

const ROUND_PRESETS = [50_000, 200_000, 1_000_000];

interface CountingResult {
  sim: CountingResponse;
  edgeCurve: PlotlyFigure;
  trueCountDist: PlotlyFigure;
}

export function CountingLab() {
  const { rules } = useRules();
  const [params, setParams] = useState<CountingParams>(DEFAULT_PARAMS);
  const { state, run } = useAction<CountingResult>();

  const update = <K extends keyof CountingParams>(
    key: K,
    value: CountingParams[K],
  ) => setParams((prev) => ({ ...prev, [key]: value }));

  const buildRequest = (): CountingRequest => ({
    num_rounds: params.num_rounds,
    rules,
    seed: params.reproducible ? params.seed : null,
    starting_bankroll: params.trackBankroll ? params.starting_bankroll : null,
    system: params.system,
    base_bet: params.base_bet,
    ramp_tiers: params.customRamp ? tiersToRamp(params.tiers) : null,
  });

  const handleRun = () => {
    const request = buildRequest();
    void run(async (signal) => {
      const [sim, edgeCurve, trueCountDist] = await Promise.all([
        runCounting(request, signal),
        viz.edgeCurve(request, signal),
        viz.trueCountDistribution(request, signal),
      ]);
      return { sim, edgeCurve, trueCountDist };
    });
  };

  const running = state.status === "loading";
  const countLabel =
    countKind(params.system) === "running count" ? "Running count" : "True count";

  return (
    <section className="flex flex-col gap-5">
      <header className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-slate-100">
          Card counting lab
        </h2>
        <p className="text-xs text-slate-400">
          Simulates a counting system that varies the bet by the count. Play
          follows basic strategy; only the wager changes.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SelectField
          id="system"
          label="Counting system"
          value={params.system}
          options={COUNTING_SYSTEMS.map((s) => ({ label: s, value: s }))}
          onChange={(v) => update("system", v)}
        />
        <NumberField
          id="base_bet"
          label="Base bet (money / unit)"
          value={params.base_bet}
          min={0.01}
          step={1}
          onChange={(v) => update("base_bet", v)}
        />
        <div className="sm:col-span-2">
          <NumberField
            id="num_rounds"
            label="Rounds"
            hint="Counting needs volume — high counts are rare."
            value={params.num_rounds}
            min={1}
            max={5_000_000}
            step={1000}
            onChange={(v) => update("num_rounds", v)}
          />
          <div className="mt-2 flex gap-2">
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
      </div>

      <div className="flex flex-col divide-y divide-slate-700/60 rounded-lg border border-slate-700/60 bg-slate-800/40 px-4 py-1">
        <Toggle
          label="Custom bet ramp"
          hint="Off = classic 1–12 Hi-Lo spread"
          checked={params.customRamp}
          onChange={(v) => update("customRamp", v)}
        />
        {params.customRamp && (
          <div className="py-3">
            <RampEditor
              tiers={params.tiers}
              countLabel={countLabel}
              baseBet={params.base_bet}
              onChange={(tiers) => update("tiers", tiers)}
            />
          </div>
        )}
        <Toggle
          label="Reproducible (fixed seed)"
          checked={params.reproducible}
          onChange={(v) => update("reproducible", v)}
        />
        {params.reproducible && (
          <div className="py-2">
            <NumberField
              id="counting_seed"
              label="Seed"
              value={params.seed}
              min={0}
              step={1}
              onChange={(v) => update("seed", v)}
            />
          </div>
        )}
        <Toggle
          label="Track bankroll"
          hint="Enables the risk-of-ruin estimate"
          checked={params.trackBankroll}
          onChange={(v) => update("trackBankroll", v)}
        />
        {params.trackBankroll && (
          <div className="py-2">
            <NumberField
              id="counting_bankroll"
              label="Starting bankroll"
              value={params.starting_bankroll}
              min={1}
              step={100}
              onChange={(v) => update("starting_bankroll", v)}
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
        {running ? "Running simulation…" : "Run counting simulation"}
      </button>

      {state.status === "error" && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
          <p className="font-medium">Simulation failed.</p>
          <p className="mt-1 text-red-300/80">{state.error.message}</p>
        </div>
      )}

      {running && (
        <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-8 text-center text-sm text-slate-400">
          Simulating {formatInt(params.num_rounds)} rounds of {params.system}…
        </div>
      )}

      {state.status === "success" && <Results result={state.data} />}
    </section>
  );
}

function Results({ result }: { result: CountingResult }) {
  const { sim, edgeCurve, trueCountDist } = result;
  const stats = sim.statistics;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard
          label="Average bet"
          value={formatUnits(sim.average_bet, 2)}
          hint="Bet-weighted spread in use"
        />
        <StatCard
          label="Aggregate edge"
          value={formatPct(stats.house_edge_pct)}
          tone={stats.house_edge_pct > 0 ? "bad" : "good"}
          hint="Bet-weighted; count edge shows in the curve"
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
      </div>

      <ChartPanel
        title="Player edge by true count"
        description="The teaching centerpiece: edge turns positive as the count climbs (green above 0, red below)."
        figure={edgeCurve}
        height={380}
      />
      <ChartPanel
        title="True-count distribution"
        description="How often each count actually occurs — high counts are rare, which is why the spread matters."
        figure={trueCountDist}
      />
    </div>
  );
}
