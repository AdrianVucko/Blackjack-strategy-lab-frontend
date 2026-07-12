import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getStrategyChart } from "@/api/endpoints";
import { useAsync } from "@/hooks/use-async";
import { useRules } from "@/state/rules-context";
import { UPCARDS, type Action } from "@/types/api";
import {
  ACTION_ABBR,
  ACTION_BG,
  buildRows,
  type StrategyTab,
} from "./strategy-grid";

const TABS: { id: StrategyTab; labelKey: string }[] = [
  { id: "hard", labelKey: "strategy.tabHard" },
  { id: "soft", labelKey: "strategy.tabSoft" },
  { id: "pairs", labelKey: "strategy.tabPairs" },
];

const ACTIONS: Action[] = ["hit", "stand", "double", "split", "surrender"];

function Legend() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap gap-3">
      {ACTIONS.map((action) => (
        <div key={action} className="flex items-center gap-1.5 text-xs">
          <span
            className={`inline-flex h-4 w-4 items-center justify-center rounded text-[10px] font-bold text-white ${ACTION_BG[action]}`}
          >
            {ACTION_ABBR[action]}
          </span>
          <span className="text-slate-300">{t(`action.${action}`)}</span>
        </div>
      ))}
    </div>
  );
}

export function StrategyChart() {
  const { t } = useTranslation();
  const { rules } = useRules();
  const [tab, setTab] = useState<StrategyTab>("hard");
  const state = useAsync((signal) => getStrategyChart(rules, signal), [rules]);

  return (
    <section className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-slate-100">
          {t("strategy.title")}
        </h2>
        <p className="text-xs text-slate-400">{t("strategy.subtitle")}</p>
      </header>

      <div className="flex items-center justify-between gap-4">
        <div
          role="tablist"
          aria-label={t("strategy.hand")}
          className="inline-flex rounded-lg border border-slate-700 bg-slate-800/60 p-1"
        >
          {TABS.map((item) => (
            <button
              key={item.id}
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => setTab(item.id)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                tab === item.id
                  ? "bg-emerald-600 text-white"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              {t(item.labelKey)}
            </button>
          ))}
        </div>
        <Legend />
      </div>

      {state.status === "loading" && (
        <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-8 text-center text-sm text-slate-400">
          {t("strategy.loading")}
        </div>
      )}

      {state.status === "error" && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-6 text-sm text-red-200">
          <p className="font-medium">{t("strategy.errorTitle")}</p>
          <p className="mt-1 text-red-300/80">{state.error.message}</p>
          <p className="mt-2 text-xs text-red-300/60">
            {t("strategy.backendHint")}{" "}
            <code>
              {import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000"}
            </code>
            ?
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
  const { t } = useTranslation();
  const rows = buildRows(chart, tab);
  const notes = rows.filter((r) => r.note);

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto">
        <table className="border-separate border-spacing-1">
          <thead>
            <tr>
              <th className="w-16 px-2 py-1 text-left text-xs font-semibold text-slate-400">
                {t("strategy.hand")}
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
                        title={t("strategy.cellTitle", {
                          hand: row.label,
                          up: u,
                          action: t(`action.${action}`),
                        })}
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
            <span className="font-semibold">{n.label}*</span>{" "}
            {t(`strategy.${n.note}`)}
          </p>
        ))}
        <p>{t("strategy.implicitNote")}</p>
      </div>
    </div>
  );
}
