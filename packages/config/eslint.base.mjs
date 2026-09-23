import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

/** Paths no package should lint. */
export const sharedIgnores = {
  ignores: [
    "**/node_modules/**",
    "**/dist/**",
    "**/.next/**",
    "**/coverage/**",
    "**/src/generated/**",
    "**/next-env.d.ts",
  ],
};

/** Rules every package agrees on. */
export const sharedRules = {
  rules: {
    "no-console": ["warn", { allow: ["warn", "error"] }],
    eqeqeq: ["error", "always"],
    "@typescript-eslint/no-unused-vars": [
      "error",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
    "@typescript-eslint/consistent-type-imports": "error",
  },
};

/** Base config for Node and library packages (api, shared, ui). */
export const base = tseslint.config(
  sharedIgnores,
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  sharedRules,
);

export default base;

/** Lets consistent-type-imports keep value imports that Nest needs for decorator metadata (DI). */
export const nestParserOptions = {
  languageOptions: {
    parserOptions: { emitDecoratorMetadata: true, experimentalDecorators: true },
  },
};
