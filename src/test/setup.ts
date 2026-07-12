import "@testing-library/jest-dom/vitest";
import { afterEach, beforeAll } from "vitest";
import { cleanup } from "@testing-library/react";
import i18n from "@/i18n";

// Force English + en-US formatting so assertions are deterministic.
beforeAll(() => {
  void i18n.changeLanguage("en");
});

afterEach(() => {
  cleanup();
});
