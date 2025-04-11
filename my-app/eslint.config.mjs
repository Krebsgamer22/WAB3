import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import airbnb from "eslint-config-airbnb";
import prettier from "eslint-config-prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    rules: {
      ...airbnb.rules,
      "react/react-in-jsx-scope": "off",
      "import/extensions": ["error", "never"],
      "import/prefer-default-export": "off", 
      "react/jsx-props-no-spreading": "off",
      "react/require-default-props": "off"
    }
  },
  ...compat.extends("next/core-web-vitals"),
  prettier,
];

export default eslintConfig;
