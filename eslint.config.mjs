import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";

// eslint-config-next v16 exports flat config directly — no FlatCompat needed.
// Tolerate either an array or a single config object from each entrypoint.
const flat = (c) => (Array.isArray(c) ? c : [c]);

const config = [
  ...flat(coreWebVitals),
  ...flat(typescript),

  {
    rules: {
      // Import ORDER is Prettier's job here (@ianvs/prettier-plugin-sort-imports), not
      // ESLint's. eslint-plugin-import's resolver fails to load under flat config and
      // warns on every file that has imports, and a formatter that fixes ordering
      // automatically beats a linter that only complains about it.

      // Type-only imports stay explicit, so it's obvious what survives compilation.
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],

      // `any` defeats the whole point of the contract in features/game-modes/types.ts.
      // Use `unknown` and narrow.
      "@typescript-eslint/no-explicit-any": "error",

      // Unused code is usually a half-finished thought. Prefix with _ to opt out.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],

      "no-console": ["warn", { allow: ["warn", "error"] }],
      eqeqeq: ["error", "always", { null: "ignore" }],
      "prefer-const": "warn",
      "no-var": "error",
    },
  },

  // Formatting belongs to Prettier. This must stay last so it switches off any
  // stylistic rules the configs above turn on.
  prettier,

  { ignores: [".next/**", "node_modules/**", "next-env.d.ts"] },
];

export default config;
