import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ApiError } from "@/api/client";
import { getRun, listRuns } from "@/api/endpoints";
import { useAction } from "@/hooks/use-action";
import { useAsync } from "@/hooks/use-async";
import { formatDateTime, formatInt, formatPct, formatSigned } from "@/lib/format";
import type { RunSummary } from "@/types/api";

const LIMIT = 20;

function KindBadge({ kind }: { kind: RunSummary["kind"] }) {
  const { t } = useTranslation();
  const style =
    kind === "counting"
      ? "bg-indigo-500/20 text-indigo-300"
      : "bg-slate-500/20 text-slate-300";
  return (
    <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${style}`}>
      {t(kind === "counting" ? "history.kindCounting" : "history.kindBasic")}
    </span>
  );
}

function RunRow({ run }: { run: RunSummary }) {
  const { t } = useTranslation();
  return (
    <tr className="border-b border-slate-800 last:border-0">
      <td className="px-3 py-2 font-mono text-sm text-slate-300">#{run.id}</td>
      <td className="px-3 py-2 text-sm text-slate-400">
        {formatDateTime(run.created_at)}
      </td>
      <td className="px-3 py-2">
        <KindBadge kind={run.kind} />
      </td>
      <td className="px-3 py-2 text-right text-sm tabular-nums text-slate-300">
        {formatInt(run.rounds_played)}
      </td>
      <td
        className={`px-3 py-2 text-right text-sm tabular-nums ${
          run.house_edge_pct > 0 ? "text-red-400" : "text-emerald-400"
        }`}
      >
        {formatPct(run.house_edge_pct)}
      </td>
      <td
        className={`px-3 py-2 text-right text-sm tabular-nums ${
          run.ev_per_round >= 0 ? "text-emerald-400" : "text-red-400"
        }`}
      >
        {formatSigned(run.ev_per_round)}
      </td>
      <td className="px-3 py-2 text-center">
        {run.ruined ? (
          <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-xs text-red-300">
            {t("history.ruined")}
          </span>
        ) : (
          <span className="text-xs text-slate-600">—</span>
        )}
      </td>
    </tr>
  );
}

function RunsTable({ runs }: { runs: RunSummary[] }) {
  const { t } = useTranslation();
  if (runs.length === 0) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-8 text-center text-sm text-slate-400">
        {t("history.empty")}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-800">
      <table className="w-full border-collapse">
        <thead className="bg-slate-800/60">
          <tr className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
            <th className="px-3 py-2 text-left">{t("history.colRun")}</th>
            <th className="px-3 py-2 text-left">{t("history.colCreated")}</th>
            <th className="px-3 py-2 text-left">{t("history.colKind")}</th>
            <th className="px-3 py-2 text-right">{t("history.colRounds")}</th>
            <th className="px-3 py-2 text-right">{t("history.colHouseEdge")}</th>
            <th className="px-3 py-2 text-right">{t("history.colEv")}</th>
            <th className="px-3 py-2 text-center">{t("history.colStatus")}</th>
          </tr>
        </thead>
        <tbody>
          {runs.map((run) => (
            <RunRow key={run.id} run={run} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RunLookup() {
  const { t } = useTranslation();
  const [id, setId] = useState("");
  const { state, run } = useAction<RunSummary>();

  const handleLookup = () => {
    const parsed = Number(id);
    if (!Number.isInteger(parsed)) return;
    void run((signal) => getRun(parsed, signal));
  };

  const notFound =
    state.status === "error" &&
    state.error instanceof ApiError &&
    state.error.status === 404;

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-slate-700/60 bg-slate-800/40 p-3">
      <span className="text-sm font-medium text-slate-200">
        {t("history.lookupTitle")}
      </span>
      <div className="flex gap-2">
        <input
          type="number"
          value={id}
          min={1}
          placeholder={t("history.runId")}
          aria-label={t("history.runId")}
          onChange={(e) => setId(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleLookup();
          }}
          className="w-32 rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400"
        />
        <button
          type="button"
          onClick={handleLookup}
          disabled={id === "" || state.status === "loading"}
          className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {t("history.lookup")}
        </button>
      </div>

      {notFound && (
        <p className="text-xs text-amber-300">
          {t("history.notFound", { id })}
        </p>
      )}
      {state.status === "error" && !notFound && (
        <p className="text-xs text-red-300">{state.error.message}</p>
      )}
      {state.status === "success" && (
        <div className="flex items-center gap-3 text-sm text-slate-300">
          <span className="font-mono">#{state.data.id}</span>
          <KindBadge kind={state.data.kind} />
          <span>
            {t("history.rounds", { value: formatInt(state.data.rounds_played) })}
          </span>
          <span>
            {t("history.edge", { value: formatPct(state.data.house_edge_pct) })}
          </span>
          {state.data.ruined && (
            <span className="text-red-300">{t("history.ruined")}</span>
          )}
        </div>
      )}
    </div>
  );
}

export function RunHistory() {
  const { t } = useTranslation();
  const [refreshKey, setRefreshKey] = useState(0);
  const state = useAsync((signal) => listRuns(LIMIT, signal), [refreshKey]);

  return (
    <section className="flex flex-col gap-4">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">
            {t("history.title")}
          </h2>
          <p className="text-xs text-slate-400">
            {t("history.subtitle", { limit: LIMIT })}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setRefreshKey((k) => k + 1)}
          className="rounded-md border border-slate-600 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700"
        >
          {t("history.refresh")}
        </button>
      </header>

      <RunLookup />

      {state.status === "loading" && (
        <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-8 text-center text-sm text-slate-400">
          {t("history.loading")}
        </div>
      )}
      {state.status === "error" && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
          <p className="font-medium">{t("history.errorTitle")}</p>
          <p className="mt-1 text-red-300/80">{state.error.message}</p>
        </div>
      )}
      {state.status === "success" && <RunsTable runs={state.data} />}
    </section>
  );
}
