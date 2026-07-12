import { lazy, Suspense, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { apiGet } from "@/api/client";
import { useAsync } from "@/hooks/use-async";
import { SUPPORTED_LANGUAGES } from "@/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { RulesConfigurator } from "@/features/rules/RulesConfigurator";
import { StrategyChart } from "@/features/strategy/StrategyChart";
import { RunHistory } from "@/features/history/RunHistory";
import { RulesProvider } from "@/state/rules-context";

// Chart-heavy views (Plotly) — loaded on demand so they stay out of the initial bundle.
const SimulatorView = lazy(() =>
  import("@/features/simulator/SimulatorView").then((m) => ({
    default: m.SimulatorView,
  })),
);
const CountingLab = lazy(() =>
  import("@/features/counting/CountingLab").then((m) => ({
    default: m.CountingLab,
  })),
);

interface Health {
  status: string;
  version: string;
  environment: string;
}

function HealthBadge() {
  const { t } = useTranslation();
  const state = useAsync((signal) => apiGet<Health>("/health", { signal }), []);

  const online = state.status === "success";
  const color = online
    ? "bg-emerald-500"
    : state.status === "loading"
      ? "bg-amber-400"
      : "bg-red-500";
  const text =
    state.status === "success"
      ? t("health.online", { version: state.data.version })
      : state.status === "loading"
        ? t("health.connecting")
        : t("health.offline");

  return (
    <div className="flex items-center gap-2 text-xs text-slate-400">
      <span className={`inline-block h-2 w-2 rounded-full ${color}`} />
      {text}
    </div>
  );
}

type View = "strategy" | "simulator" | "counting" | "history";

const VIEWS: { id: View; labelKey: string }[] = [
  { id: "strategy", labelKey: "nav.strategy" },
  { id: "simulator", labelKey: "nav.simulator" },
  { id: "counting", labelKey: "nav.counting" },
  { id: "history", labelKey: "nav.history" },
];

function App() {
  const { t, i18n } = useTranslation();
  const [view, setView] = useState<View>("strategy");

  useEffect(() => {
    document.documentElement.lang =
      SUPPORTED_LANGUAGES.find((lng) => i18n.language?.startsWith(lng)) ?? "hr";
  }, [i18n.language]);

  return (
    <RulesProvider>
      <div className="mx-auto flex min-h-full max-w-6xl flex-col gap-6 px-4 py-6">
        <header className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-50">
              Blackjack Strategy Lab
            </h1>
            <p className="text-sm text-slate-400">{t("app.subtitle")}</p>
          </div>
          <div className="flex items-center gap-4">
            <HealthBadge />
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(320px,360px)_1fr]">
          <aside className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <RulesConfigurator />
          </aside>
          <main className="flex flex-col gap-4">
            <nav className="inline-flex w-fit rounded-lg border border-slate-700 bg-slate-800/60 p-1">
              {VIEWS.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  aria-current={view === v.id}
                  onClick={() => setView(v.id)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    view === v.id
                      ? "bg-emerald-600 text-white"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  {t(v.labelKey)}
                </button>
              ))}
            </nav>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <Suspense
                fallback={
                  <div className="p-8 text-center text-sm text-slate-400">
                    {t("app.loading")}
                  </div>
                }
              >
                {view === "strategy" && <StrategyChart />}
                {view === "simulator" && <SimulatorView />}
                {view === "counting" && <CountingLab />}
                {view === "history" && <RunHistory />}
              </Suspense>
            </div>
          </main>
        </div>
      </div>
    </RulesProvider>
  );
}

export default App;
