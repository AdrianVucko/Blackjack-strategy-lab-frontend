import { useState } from "react";
import { useTranslation } from "react-i18next";
import { applyTheme, getInitialTheme, type Theme } from "@/lib/theme";

export function ThemeToggle() {
  const { t } = useTranslation();
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    setTheme(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t("theme.toggle")}
      title={t("theme.toggle")}
      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-700 text-sm text-slate-300 hover:bg-slate-700"
    >
      {theme === "dark" ? "☀" : "🌙"}
    </button>
  );
}
