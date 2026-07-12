import { afterEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "@/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { RulesConfigurator } from "@/features/rules/RulesConfigurator";
import { RulesProvider } from "@/state/rules-context";

afterEach(async () => {
  await i18n.changeLanguage("en");
});

describe("i18n", () => {
  it("renders Croatian strings when the language is hr", async () => {
    await i18n.changeLanguage("hr");
    render(
      <RulesProvider>
        <RulesConfigurator />
      </RulesProvider>,
    );

    expect(screen.getByRole("heading", { name: "Pravila" })).toBeInTheDocument();
    expect(screen.getByText("Vrati zadano")).toBeInTheDocument();
    expect(
      screen.getByRole("switch", { name: /djelitelj vuče na meku 17/i }),
    ).toBeInTheDocument();
  });

  it("renders German strings when the language is de", async () => {
    await i18n.changeLanguage("de");
    render(
      <RulesProvider>
        <RulesConfigurator />
      </RulesProvider>,
    );

    expect(screen.getByRole("heading", { name: "Regeln" })).toBeInTheDocument();
    expect(
      screen.getByRole("switch", { name: /dealer zieht bei soft 17/i }),
    ).toBeInTheDocument();
  });

  it("pluralizes decks with Croatian rules", async () => {
    await i18n.changeLanguage("hr");
    // 1 -> one (špil), 2 -> few (špila), 6 -> other (špilova)
    expect(i18n.t("rules.deck", { count: 1 })).toBe("1 špil");
    expect(i18n.t("rules.deck", { count: 2 })).toBe("2 špila");
    expect(i18n.t("rules.deck", { count: 6 })).toBe("6 špilova");
  });

  it("switches language via the LanguageSwitcher", async () => {
    const user = userEvent.setup();
    render(
      <RulesProvider>
        <LanguageSwitcher />
        <RulesConfigurator />
      </RulesProvider>,
    );

    expect(screen.getByRole("heading", { name: "Rules" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "HR" }));

    expect(
      await screen.findByRole("heading", { name: "Pravila" }),
    ).toBeInTheDocument();
  });
});
