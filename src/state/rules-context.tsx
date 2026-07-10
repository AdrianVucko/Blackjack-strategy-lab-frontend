import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_RULES } from "@/lib/rules";
import type { Rules } from "@/types/api";

interface RulesContextValue {
  rules: Rules;
  setRules: (rules: Rules) => void;
  updateRule: <K extends keyof Rules>(key: K, value: Rules[K]) => void;
  reset: () => void;
}

const RulesContext = createContext<RulesContextValue | null>(null);

export function RulesProvider({ children }: { children: ReactNode }) {
  const [rules, setRules] = useState<Rules>(DEFAULT_RULES);

  const updateRule = useCallback(
    <K extends keyof Rules>(key: K, value: Rules[K]) => {
      setRules((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const reset = useCallback(() => setRules(DEFAULT_RULES), []);

  const value = useMemo<RulesContextValue>(
    () => ({ rules, setRules, updateRule, reset }),
    [rules, updateRule, reset],
  );

  return <RulesContext value={value}>{children}</RulesContext>;
}

export function useRules(): RulesContextValue {
  const ctx = useContext(RulesContext);
  if (!ctx) {
    throw new Error("useRules must be used within a RulesProvider");
  }
  return ctx;
}
