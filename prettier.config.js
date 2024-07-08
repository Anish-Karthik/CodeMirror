/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions & import('@ianvs/prettier-plugin-sort-imports').PluginOptions & import('prettier-plugin-packagejson').PluginOptions & import('@trivago/prettier-plugin-sort-imports').PluginOptions}  */

const config = {
  endOfLine: "lf",
  trailingComma: "es5",
  semi: false,
  singleQuote: false,
  tabWidth: 2,
  useTabs: false, // Indent lines with spaces instead of tabs.
  semi: true, // Print semicolons at the ends of statements.
  singleQuote: true, // Use single quotes instead of double quotes.
  quoteProps: 'as-needed', // Change when properties in objects are quoted.
  jsxSingleQuote: false, // Use single quotes instead of double quotes in JSX.
  trailingComma: 'es5', // Print trailing commas wherever possible in ES5 (objects, arrays, etc.)
  bracketSpacing: true, // Print spaces between brackets in object literals.
  jsxBracketSameLine: false, // Put the `>` of a multi-line JSX element at the end of the last line.
  arrowParens: 'always', // Include parentheses around a sole arrow function parameter.
  rangeStart: 0, // Format only a segment of a file.
  rangeEnd: Infinity, // Format only a segment of a file.
  requirePragma: false, // Prettier can restrict itself to only format files that contain a special comment, called a pragma, at the top of the file.
  insertPragma: false, // Prettier can insert a special @format marker at the top of files specifying that the file has been formatted with prettier.
  proseWrap: 'preserve', // By default, Prettier will wrap markdown text as-is since some services use a linebreak-sensitive renderer.
  htmlWhitespaceSensitivity: 'css', // Specify the global whitespace sensitivity for HTML files.
  importOrder: [
    "^(react/(.*)$)|^(react$)",
    "^(next/(.*)$)|^(next$)",
    "<THIRD_PARTY_MODULES>",
    "",
    "^types$",
    "^@/types/(.*)$",
    "^@/config/(.*)$",
    "^@/lib/(.*)$",
    "^@/hooks/(.*)$",
    "^@/components/ui/(.*)$",
    "^@/components/(.*)$",
    "^@/styles/(.*)$",
    "^@/app/(.*)$",
    "",
    "^[./]",
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  embeddedLanguageFormatting: 'auto', // Control whether Prettier formats quoted code embedded in the file.
  plugins: ["prettier-plugin-tailwindcss", "@trivago/prettier-plugin-sort-imports", "prettier-plugin-packagejson", "prettier-plugin-organize-imports"],

}

export default config;
