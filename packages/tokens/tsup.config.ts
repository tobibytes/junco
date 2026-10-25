import { readFileSync, writeFileSync } from "node:fs";
import { defineConfig } from "tsup";
import { parseTokens } from "./src/parse.ts";
import { toW3C } from "./src/w3c.ts";

const tokens = parseTokens(readFileSync("src/tokens.css", "utf8"));

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  define: { __JUNCO_TOKENS__: JSON.stringify(tokens) },
  async onSuccess() {
    writeFileSync("dist/tokens.json", JSON.stringify(toW3C(tokens), null, 2) + "\n");
  },
});
