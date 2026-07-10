import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RulesConfigurator } from "./RulesConfigurator";
import { RulesProvider, useRules } from "@/state/rules-context";

function RulesProbe() {
  const { rules } = useRules();
  return <span data-testid="h17">{String(rules.dealer_hits_soft_17)}</span>;
}

function setup() {
  return render(
    <RulesProvider>
      <RulesConfigurator />
      <RulesProbe />
    </RulesProvider>,
  );
}

describe("RulesConfigurator", () => {
  it("defaults dealer_hits_soft_17 to true and toggles it", async () => {
    const user = userEvent.setup();
    setup();

    expect(screen.getByTestId("h17")).toHaveTextContent("true");

    const toggle = screen.getByRole("switch", {
      name: /dealer hits soft 17/i,
    });
    expect(toggle).toHaveAttribute("aria-checked", "true");

    await user.click(toggle);
    expect(screen.getByTestId("h17")).toHaveTextContent("false");
    expect(toggle).toHaveAttribute("aria-checked", "false");
  });

  it("resets rules to defaults", async () => {
    const user = userEvent.setup();
    setup();

    await user.click(screen.getByRole("switch", { name: /surrender allowed/i }));
    await user.click(screen.getByRole("button", { name: /reset defaults/i }));

    expect(
      screen.getByRole("switch", { name: /surrender allowed/i }),
    ).toHaveAttribute("aria-checked", "false");
  });
});
