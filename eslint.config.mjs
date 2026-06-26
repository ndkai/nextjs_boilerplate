import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  {
    rules: {
      // Bắt buộc dùng @/ alias thay vì import cross-feature (../../other-feature/...)
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../../*/_lib/*", "../../*/_hooks/*", "../../*/_components/*"],
              message: "Cross-feature imports không được phép. Dùng @/lib/ hoặc @/components/ thay thế.",
            },
          ],
        },
      ],
      // Ưu tiên const hơn let khi không reassign
      "prefer-const": "error",
      // Không dùng any tường minh
      "@typescript-eslint/no-explicit-any": "warn",
      // Không để console.log trong production code
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
]);

export default eslintConfig;
