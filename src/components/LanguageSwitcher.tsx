import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES, type Language } from "@/i18n";

const LABELS: Record<Language, string> = { hr: "HR", en: "EN", de: "DE" };

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const current: Language =
    SUPPORTED_LANGUAGES.find((lng) => i18n.language?.startsWith(lng)) ?? "hr";

  return (
    <div
      role="group"
      aria-label={t("lang.label")}
      className="inline-flex overflow-hidden rounded-md border border-slate-700"
    >
      {SUPPORTED_LANGUAGES.map((lng) => (
        <button
          key={lng}
          type="button"
          aria-pressed={current === lng}
          onClick={() => void i18n.changeLanguage(lng)}
          className={`px-2 py-1 text-xs font-medium transition-colors ${
            current === lng
              ? "bg-emerald-600 text-white"
              : "text-slate-300 hover:bg-slate-700"
          }`}
        >
          {LABELS[lng]}
        </button>
      ))}
    </div>
  );
}
