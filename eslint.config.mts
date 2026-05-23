import obsidianmd from "eslint-plugin-obsidianmd";
import globals from "globals";

import { defineConfig, globalIgnores } from "eslint/config";

import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores(["**/node_modules/**", "main.js", "**/*.json", "**/.worktrees"]),
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.mts"],
    rules: {
      "obsidianmd/rule-custom-message": "warn",
    },
    extends: [
      ...obsidianmd.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
    ],
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ["**/*.mjs"],
    ...tseslint.configs.disableTypeChecked,
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ["eslint.config.mts"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
]);
