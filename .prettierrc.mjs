// .prettierrc.mjs

// Correct way to import prettier-plugin-tailwindcss:
// It exports itself directly, not a default export.

const prettierConfig = {
  // Your other Prettier options here (if you have any), e.g.:
  // singleQuote: true,
  // semi: false,
  // printWidth: 120,

  "plugins": ["prettier-plugin-tailwindcss"]
};

export default prettierConfig;