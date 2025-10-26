// eslint config
/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["next/core-web-vitals"],
  rules: {
    "no-restricted-syntax": [
      "error",
      {
        selector: "JSXText[value=/[A-Za-zÀ-ÖØ-öø-ÿ0-9]/]",
        message: "Hardcoded UI string detected. Please use t('key') or a locale aware helper.",
      },
    ],
  },
  overrides: [
    {
      files: ["app/admin/**/*.{js,jsx,ts,tsx}", "components/admin/**/*.{js,jsx,ts,tsx}"],
      rules: {
        "no-restricted-syntax": "off",
      },
    },
    {
      files: ["components/alalehed/ChatBody.jsx"],
      rules: {
        "no-restricted-syntax": "off",
      },
    },
    {
      files: ["tests/**/*", "**/*.test.*"],
      rules: {
        "no-restricted-syntax": "off",
      },
    },
  ],
};
