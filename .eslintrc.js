module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "eslint:recommended",
    "standard",
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },
  globals: {
    GM_info: "readonly",
    GM_addStyle: "readonly",
    GM_addElement: "readonly",
  },
  rules: {
    // Doubleqoutes erzwingen (" statt ')
    quotes: ["warn", "double"],
    // Kommas am Ende von Objekten hinzufügen, sobals das Objekt mehr als eine Zeile hat
    "comma-dangle": ["warn", "always-multiline"],
  },
}
