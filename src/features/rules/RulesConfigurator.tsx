import {
  NumberField,
  RangeField,
  SelectField,
  Toggle,
} from "@/components/ui/controls";
import { useRules } from "@/state/rules-context";

const PAYOUT_OPTIONS = [
  { label: "3:2 (1.5)", value: 1.5 },
  { label: "6:5 (1.2)", value: 1.2 },
  { label: "1:1 (even money)", value: 1.0 },
] as const;

const DECK_OPTIONS = [1, 2, 4, 6, 8].map((n) => ({
  label: `${n} deck${n > 1 ? "s" : ""}`,
  value: n,
}));

export function RulesConfigurator() {
  const { rules, updateRule, reset } = useRules();

  return (
    <section className="flex flex-col gap-5">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Rules</h2>
          <p className="text-xs text-slate-400">
            Drives the strategy chart and every simulation.
          </p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="rounded-md border border-slate-600 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700"
        >
          Reset defaults
        </button>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SelectField
          id="num_decks"
          label="Number of decks"
          value={rules.num_decks}
          options={DECK_OPTIONS}
          onChange={(v) => updateRule("num_decks", v)}
        />
        <SelectField
          id="blackjack_payout"
          label="Blackjack payout"
          value={rules.blackjack_payout}
          options={PAYOUT_OPTIONS}
          onChange={(v) => updateRule("blackjack_payout", v)}
        />
        <NumberField
          id="max_splits"
          label="Max splits"
          hint="0–4 hands"
          value={rules.max_splits}
          min={0}
          max={4}
          step={1}
          onChange={(v) => updateRule("max_splits", v)}
        />
        <RangeField
          id="penetration"
          label="Penetration"
          hint="Fraction of shoe dealt before reshuffle"
          value={rules.penetration}
          min={0.1}
          max={1}
          step={0.05}
          format={(v) => `${Math.round(v * 100)}%`}
          onChange={(v) => updateRule("penetration", v)}
        />
      </div>

      <div className="flex flex-col divide-y divide-slate-700/60 rounded-lg border border-slate-700/60 bg-slate-800/40 px-4 py-1">
        <Toggle
          label="Dealer hits soft 17"
          hint="H17 adds roughly +0.2% house edge vs. S17"
          checked={rules.dealer_hits_soft_17}
          onChange={(v) => updateRule("dealer_hits_soft_17", v)}
        />
        <Toggle
          label="Double allowed"
          checked={rules.double_allowed}
          onChange={(v) => updateRule("double_allowed", v)}
        />
        <Toggle
          label="Double after split"
          checked={rules.double_after_split}
          onChange={(v) => updateRule("double_after_split", v)}
        />
        <Toggle
          label="Resplit allowed"
          checked={rules.resplit_allowed}
          onChange={(v) => updateRule("resplit_allowed", v)}
        />
        <Toggle
          label="Surrender allowed"
          checked={rules.surrender_allowed}
          onChange={(v) => updateRule("surrender_allowed", v)}
        />
      </div>
    </section>
  );
}
