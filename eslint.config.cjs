module.exports = [
  {
    files: ["**/*.cjs"],
    ignores: ["node_modules/**", "dist/**"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script",
    },
    rules: {},
  },
];
