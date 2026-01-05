import path from "node:path";
import { fileURLToPath } from "node:url";

import { FlatCompat } from "@eslint/eslintrc";
import globals from "globals";
import unusedImports from "eslint-plugin-unused-imports";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const config = [
  // Next.js reeglid (hoiame, aga teeme oma override’idega praktiliseks)
  ...compat.extends("next/core-web-vitals"),

  // Üldised ignore’id (väga oluline müra vähendamiseks)
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "dist/**",
      "build/**",
      "coverage/**",
      "generated/**",
      // kui sul on prisma client genereeritud mujale, lisa siia
      // "prisma/generated/**",
    ],
  },

  // Default: browser globals (enamik komponente/pages)
  {
    files: ["**/*.{js,jsx,mjs,cjs}"],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },

  // Server/Node kontekst: API route’id ja serveri utilid
  {
    files: [
      "app/api/**/*.js",
      "lib/**/*.js",
      "auth.js",
      "next.config.mjs",
      "public/sw.js",
    ],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
  },

  // CLEANUP-FIRST reeglid: kasutud importid ja kasutamata muutujad
  {
    plugins: {
      "unused-imports": unusedImports,
    },
    rules: {
      // Peamine: eemaldab kasutud importid automaatselt (--fix)
      "unused-imports/no-unused-imports": "error",

      // Kasutamata muutujad: hoiatuseks (mitte error), et ei blokeeriks
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],

      // Väldi topelt raporteid
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",

      // Müra vähendamiseks: paljud “stiili/harjumuse” reeglid maha või leebemaks
      "no-empty": ["warn", { allowEmptyCatch: true }],
      "no-console": "off",
      "no-debugger": "warn",

      // Need kipuvad vanemas koodis palju lärmi tegema:
      "no-useless-escape": "warn",
      "no-control-regex": "warn",
    },
  },

  // ESLint config faili enda vaikne käsitlus
  {
    files: ["eslint.config.mjs"],
    rules: {
      "import/no-anonymous-default-export": "off",
    },
  },
];

export default config;
