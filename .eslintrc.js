module.exports = {
  extends: "react-app",
  env: {
    browser: true,
    node: true,
    jest: true,
  },
  rules: {
    "indent": ["warn", 2],
    "prefer-const": ["warn", {
      "destructuring": "all",
    }],
    "no-var": "warn",
    "semi": ["warn", "never"],
    "no-unexpected-multiline": "error",
    "quotes": ["warn", "single"],
    "no-else-return": "warn",
  }
}
