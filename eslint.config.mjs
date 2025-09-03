// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // AJOUTEZ LA CONFIGURATION POUR ESLINT-PLUGIN-TAILWINDCS
  ...compat.config({
    extends: ["next/core-web-vitals", "next/typescript"],
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "no-unused-vars": "off",
    },
  }),
  ...compat.config({
    extends: [
      "plugin:tailwindcss/recommended", // Utilise la configuration recommandée du plugin Tailwind,
      "prettier",
    ],
    // Options spécifiques pour eslint-plugin-tailwindcss si besoin
    settings: {
      tailwindcss: {
        callees: ["cn", "cva"], // Ajoutez ici toutes les fonctions qui concatènent des classes (ex: 'cn' ou 'cva')
      },
    },
    rules: {
      "tailwindcss/no-custom-classname": "off",
      "tailwindcss/classnames-order": "off",
    },
  }),
  ...storybook.configs["flat/recommended"],
];
export default eslintConfig;
