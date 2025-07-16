import { defineConfig } from "eslint/config";
import css from "@eslint/css";

export default defineConfig([
  {
    files: ["**/*.css"],
    plugins: { css },
    language: "css/css",
    extends: ["css/recommended"],
    rules: {
      "css/no-duplicate-imports": "error",
      "css/no-invalid-properties": "error",
      "css/no-duplicate-properties": "error",
      "css/no-important": "off",      // Või "warn", kui soovid lihtsalt teada anda
      "css/use-baseline": "off",
    },
  },
  // ...teised JS/TS konfiguratsioonid
]);
