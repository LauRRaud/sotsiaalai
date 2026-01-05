import path from "node:path";
import { fileURLToPath } from "node:url";

import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import globals from "globals";
import unusedImports from "eslint-plugin-unused-imports";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// Hoia config nimetatud (väldib anonüümse default export hoiatust mõnest reeglist)
const config = [
  // JS baasreeglid
  js.configs.recommended,

  // Next.js: core-web-vitals (FlatCompat kaudu)
  ...compat.extends("next/core-web-vitals"),

  // Üldised reeglid kogu projektile
  {
    rules: {
      // Lubame tühja catch plokki (sul on palju best-effort try/catch)
      "no-empty": ["error", { allowEmptyCatch: true }],

      // Kui sul on teadlikult regexid, milles on control-chars, siis kas:
      // 1) paranda regex või
      // 2) kasuta rea peal eslint-disable-next-line
      // Jätan reegli vaikimisi ON, sest see võib päriselt vigu paljastada.
      // "no-control-regex": "off",
    },
  },

  // Eemalda kasutud importid ja leia kasutud muutujad
  {
    plugins: {
      "unused-imports": unusedImports,
    },
    rules: {
      // autofix eemaldab kasutud importid
      "unused-imports/no-unused-imports": "error",

      // unused vars: luba "_" prefiksiga teadlikult kasutamata
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],

      // väldi topelt “unused vars” raporteid
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },

  // Browser/Client globaalid (enamik app/components faile)
  {
    files: ["**/*.{js,jsx,mjs,cjs}"],
    ignores: [
      // server/build output
      ".next/**",
      "node_modules/**",
      "out/**",
      "dist/**",
      "build/**",
      "coverage/**",

      // generated (prisma jms)
      "generated/**",
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },

  // Node/Server globaalid API route'idele ja serverifailidele
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
        ...globals.browser, // sw.js ja mõned web-API'd (URL, Request, etc)
      },
    },
  },

  // Spetsiifiline: ESLint config fail ise – ära lärma import/no-anonymous-default-export vms üle
  {
    files: ["eslint.config.mjs"],
    rules: {
      "import/no-anonymous-default-export": "off",
    },
  },
];

export default config;
