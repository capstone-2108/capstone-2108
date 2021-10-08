module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: "plugin:react/recommended",
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 12,
    sourceType: "module"
  },
  plugins: ["react"],
  rules: {
    semi: ["off", "always"],
    quotes: ["off", "double"],
    indent: ["off", 2],
    // "brace-style": [2, "stroustrup", { allowSingleLine: true }]
  }
};
