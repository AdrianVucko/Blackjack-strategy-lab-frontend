import { useTranslation } from "react-i18next";
import {
  NumberField,
  RangeField,
  SelectField,
  Toggle,
} from "@/components/ui/controls";
import { useRules } from "@/state/rules-context";

const DECK_VALUES = [1, 2, 4, 6, 8];

export function RulesConfigurator() {
  const { t } = useTranslation();
  const { rules, updateRule, reset } = useRules();

  const payoutOptions = [
    { label: t("rules.payout32"), value: 1.5 },
    { label: t("rules.payout65"), value: 1.2 },
    { label: t("rules.payout11"), value: 1.0 },
  ];

  const deckOptions = DECK_VALUES.map((n) => ({
    label: t("rules.deck", { count: n }),
    value: n,
  }));

  return (
    <section className="flex flex-col gap-5">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">
            {t("rules.title")}
          </h2>
          <p className="text-xs text-slate-400">{t("rules.subtitle")}</p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="rounded-md border border-slate-600 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700"
        >
          {t("rules.reset")}
        </button>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SelectField
          id="num_decks"
          label={t("rules.numDecks")}
          value={rules.num_decks}
          options={deckOptions}
          onChange={(v) => updateRule("num_decks", v)}
        />
        <SelectField
          id="blackjack_payout"
          label={t("rules.payout")}
          value={rules.blackjack_payout}
          options={payoutOptions}
          onChange={(v) => updateRule("blackjack_payout", v)}
        />
        <NumberField
          id="max_splits"
          label={t("rules.maxSplits")}
          hint={t("rules.maxSplitsHint")}
          value={rules.max_splits}
          min={0}
          max={4}
          step={1}
          onChange={(v) => updateRule("max_splits", v)}
        />
        <RangeField
          id="penetration"
          label={t("rules.penetration")}
          hint={t("rules.penetrationHint")}
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
          label={t("rules.dealerHitsSoft17")}
          hint={t("rules.dealerHitsSoft17Hint")}
          checked={rules.dealer_hits_soft_17}
          onChange={(v) => updateRule("dealer_hits_soft_17", v)}
        />
        <Toggle
          label={t("rules.doubleAllowed")}
          checked={rules.double_allowed}
          onChange={(v) => updateRule("double_allowed", v)}
        />
        <Toggle
          label={t("rules.doubleAfterSplit")}
          checked={rules.double_after_split}
          onChange={(v) => updateRule("double_after_split", v)}
        />
        <Toggle
          label={t("rules.resplitAllowed")}
          checked={rules.resplit_allowed}
          onChange={(v) => updateRule("resplit_allowed", v)}
        />
        <Toggle
          label={t("rules.surrenderAllowed")}
          checked={rules.surrender_allowed}
          onChange={(v) => updateRule("surrender_allowed", v)}
        />
      </div>
    </section>
  );
}
