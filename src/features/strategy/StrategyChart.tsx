import { useState } from "react";
import { getStrategyChart } from "@/api/endpoints";
import { useAsync } from "@/hooks/use-async";
import { useRules } from "@/state/rules-context";
import { UPCARDS, type Action } from "@/types/api";
import {
  ACTION_ABBR,
  ACTION_BG,
  ACTION_LABELS,
  buildRows,
  type StrategyTab,
} from "./strategy-grid";

const TABS: { id: StrategyTab; label: string }[] = [
  { id: "hard", label: "Hard totals" },
  { id: "soft", label: "Soft hands" },
  { id: "pairs", label: "Pairs" },
];

const ACTIONS: Action[] = ["hit", "stand", "double", "split", "surrender"];

function Legend() {
  return (
    <div className="flex flex-wrap gap-3">
      {ACTIONS.map((action) => (
        <div key={action} className="flex items-center gap-1.5 text-xs">
          <span
            className={`inline-flex h-4 w-4 items-center justify-center rounded text-[10px] font-bold text-white ${ACTION_BG[action]}`}
          >
            {ACTION_ABBR[action]}
          </span>
          <span className="text-slate-300">{ACTION_LABELS[action]}</span>
        </div>
      ))}
    </div>
  );
}

export function StrategyChart() {
  const { rules } = useRules();
  const [tab, setTab] = useState<StrategyTab>("hard");
  const state = useAsync(
    (signal) => getStrategyChart(rules, signal),
    [rules],
  );

  return (
    <section className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-slate-100">
          Basic strategy chart
        </h2>
        <p className="text-xs text-slate-400">
          Optimal play for the current rules. Rows are hands, columns are the
          dealer&rsquo;s up-card. Re-computed whenever the rules change.
        </p>
      </header>

      <div className="flex items-center justify-between gap-4">
        <div
          role="tablist"
          aria-label="Hand category"
          className="inline-flex rounded-lg border border-slate-700 bg-slate-800/60 p-1"
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                tab === t.id
                  ? "bg-emerald-600 text-white"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <Legend />
      </div>

      {state.status === "loading" && (
        <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-8 text-center text-sm text-slate-400">
          Loading strategy…
        </div>
      )}

      {state.status === "error" && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-6 text-sm text-red-200">
          <p className="font-medium">Could not load the strategy chart.</p>
          <p className="mt-1 text-red-300/80">{state.error.message}</p>
          <p className="mt-2 text-xs text-red-300/60">
            Is the backend running on{" "}
            <code>{import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000"}</code>?
          </p>
        </div>
      )}

      {state.status === "success" && (
        <ChartGrid chart={state.data.chart} tab={tab} />
      )}
    </section>
  );
}

interface ChartGridProps {
  chart: import("@/types/api").StrategyChartResponse["chart"];
  tab: StrategyTab;
}

function ChartGrid({ chart, tab }: ChartGridProps) {
  const rows = buildRows(chart, tab);
  const notes = rows.filter((r) => r.note);

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto">
        <table className="border-separate border-spacing-1">
          <thead>
            <tr>
              <th className="w-16 px-2 py-1 text-left text-xs font-semibold text-slate-400">
                Hand
              </th>
              {UPCARDS.map((u) => (
                <th
                  key={u}
                  className="w-10 px-1 py-1 text-center text-xs font-semibold text-slate-400"
                >
                  {u}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <th
                  scope="row"
                  className={`px-2 py-1 text-left text-sm font-semibold ${
                    row.implicit ? "text-slate-500" : "text-slate-200"
                  }`}
                >
                  {row.label}
                  {row.note && <span className="ml-1 text-slate-500">*</span>}
                </th>
                {UPCARDS.map((u) => {
                  const action = row.actions[u];
                  return (
                    <td key={u} className="p-0">
                      <div
                        title={`${row.label} vs ${u}: ${ACTION_LABELS[action]}`}
                        className={`flex h-9 w-10 items-center justify-center rounded text-xs font-bold text-white ${ACTION_BG[action]} ${
                          row.implicit ? "opacity-60" : ""
                        }`}
                      >
                        {ACTION_ABBR[action]}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-1 text-xs text-slate-500">
        {notes.map((n) => (
          <p key={n.label}>
            <span className="font-semibold">{n.label}*</span> {n.note}
          </p>
        ))}
        <p>
          Dimmed rows are implied by the rules (hard ≤7 always hit, ≥18 always
          stand) and are not returned by the API.
        </p>
      </div>
    </div>
  );
}
