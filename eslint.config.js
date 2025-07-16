import { defineConfig } from "eslint/config";
import css from "@eslint/css";

export default defineConfig([
  // ...muu konfi osa
  {
    files: ["**/*.css"],
    plugins: { css },
    language: "css/css",
    extends: ["css/recommended"],
    rules: {
      // Vajadusel lisa reegleid
    },
  },
]);
