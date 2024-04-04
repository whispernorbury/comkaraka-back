module.exports = {
    parser: "@typescript-eslint/parser",
    plugins: [
        "@typescript-eslint",
        "eslint-plugin-prettier",
        "prettier",
    ],
    extends: [
        "plugin:@typescript-eslint/recommended",
        "eslint:recommended",
        "prettier",
    ],
    env: {
        "node": true,
        "browser": true,
    },
    rules: { },
};