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

const eslintConfig = [// AJOUTEZ LA CONFIGURATION POUR ESLINT-PLUGIN-TAILWINDCS
...compat.config({
  extends: ["next/core-web-vitals", "next/typescript"],
  rules: {
    "@typescript-eslint/no-unused-vars": "warn",
    "no-unused-vars": "off",
  },
}), ...compat.config({
  extends: [
    "plugin:tailwindcss/recommended", // Utilise la configuration recommandée du plugin Tailwind,
    "prettier",
  ],
  // Options spécifiques pour eslint-plugin-tailwindcss si besoin
  settings: {
    tailwindcss: {
      callees: ["cn", "cva"], // Ajoutez ici toutes les fonctions qui concatènent des classes (ex: 'cn' ou 'cva')
      config: "./tailwind.config.ts", // Chemin vers votre tailwind.config.ts (souvent pas nécessaire si au même niveau)
    },
  },
  rules: {
    // Optionnel : Désactiver la règle si vous avez des classes CSS personnalisées qui ne sont pas des utilitaires Tailwind
    // Par exemple, vos classes .list-check, .list-rocket, etc.
    "tailwindcss/no-custom-classname": "off",
    // Optionnel : Activer l'ordre des classes (peut être "warn" ou "error")
    "tailwindcss/classnames-order": "off",
  },
}), ...storybook.configs["flat/recommended"]];
export default eslintConfig;
