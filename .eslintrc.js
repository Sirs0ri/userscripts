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
    ecmaVersion: "latest",
    sourceType: "module",
  },
  globals: {
    GM_addStyle: "readonly",
    GM_addElement: "readonly",
    GM_getResourceURL: "readonly",
    GM_getResourceText: "readonly",
    GM_info: "readonly",
  },
  rules: {
    // Doubleqoutes erzwingen (" statt ')
    quotes: ["warn", "double"],
    // Kommas am Ende von Objekten hinzufügen, sobals das Objekt mehr als eine Zeile hat
    "comma-dangle": ["warn", "always-multiline"],
  },
}
