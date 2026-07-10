import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: "neutral" | "good" | "bad";
}

const TONE: Record<NonNullable<StatCardProps["tone"]>, string> = {
  neutral: "text-slate-100",
  good: "text-emerald-400",
  bad: "text-red-400",
};

export function StatCard({ label, value, hint, tone = "neutral" }: StatCardProps) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-slate-700/60 bg-slate-800/40 p-3">
      <span className="text-xs font-medium tracking-wide text-slate-400 uppercase">
        {label}
      </span>
      <span className={`text-xl font-semibold tabular-nums ${TONE[tone]}`}>
        {value}
      </span>
      {hint && <span className="text-xs text-slate-500">{hint}</span>}
    </div>
  );
}
