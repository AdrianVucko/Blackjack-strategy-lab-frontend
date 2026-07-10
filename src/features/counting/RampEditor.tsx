import { RAMP_FLOOR, type RampTier } from "./counting";

interface RampEditorProps {
  tiers: RampTier[];
  countLabel: string;
  baseBet: number;
  onChange: (tiers: RampTier[]) => void;
}

export function RampEditor({
  tiers,
  countLabel,
  baseBet,
  onChange,
}: RampEditorProps) {
  const setTier = (index: number, patch: Partial<RampTier>) =>
    onChange(tiers.map((t, i) => (i === index ? { ...t, ...patch } : t)));

  const addTier = () => {
    const last = tiers[tiers.length - 1];
    const nextCount = last ? last.count + 1 : 1;
    const nextUnits = last ? last.units * 2 : 1;
    onChange([...tiers, { count: nextCount, units: nextUnits }]);
  };

  const removeTier = (index: number) =>
    onChange(tiers.filter((_, i) => i !== index));

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-[1fr_1fr_2rem] gap-2 text-xs font-medium text-slate-400">
        <span>{countLabel} ≥</span>
        <span>Bet (units)</span>
        <span />
      </div>

      {tiers.map((tier, index) => {
        const isFloor = index === 0;
        return (
          <div
            key={index}
            className="grid grid-cols-[1fr_1fr_2rem] items-center gap-2"
          >
            {isFloor ? (
              <span className="rounded-md border border-slate-700 bg-slate-800/60 px-3 py-2 text-sm text-slate-400">
                floor (−∞)
              </span>
            ) : (
              <input
                type="number"
                aria-label={`Tier ${index} count`}
                value={tier.count}
                step={1}
                onChange={(e) => setTier(index, { count: Number(e.target.value) })}
                className="rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400"
              />
            )}
            <input
              type="number"
              aria-label={`Tier ${index} units`}
              value={tier.units}
              min={0}
              step={1}
              onChange={(e) => setTier(index, { units: Number(e.target.value) })}
              className="rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400"
            />
            <button
              type="button"
              aria-label={`Remove tier ${index}`}
              onClick={() => removeTier(index)}
              disabled={tiers.length <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-600 text-slate-400 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ×
            </button>
          </div>
        );
      })}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={addTier}
          className="rounded-md border border-slate-600 px-2 py-1 text-xs text-slate-300 hover:bg-slate-700"
        >
          + Add tier
        </button>
        <span className="text-xs text-slate-500">
          Max wager: {(Math.max(...tiers.map((t) => t.units)) * baseBet).toFixed(0)}{" "}
          ({Math.max(...tiers.map((t) => t.units))}× {baseBet})
        </span>
      </div>

      <p className="text-xs text-slate-500">
        Step function: bet each tier&rsquo;s units while the {countLabel.toLowerCase()} is at
        or above its threshold. The floor tier applies below all others (sent as{" "}
        {RAMP_FLOOR}).
      </p>
    </div>
  );
}
