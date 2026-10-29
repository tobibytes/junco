import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { getTokensFrom, type TokenFiles, type TokenFormat } from "./tools-core";

export * from "./tools-core";

const require = createRequire(import.meta.url);

/** The token files from the installed @junco/tokens package. */
export const nodeTokenFiles: TokenFiles = {
  css: () => readFile(require.resolve("@junco/tokens/tokens.css"), "utf8"),
  json: () => readFile(require.resolve("@junco/tokens/tokens.json"), "utf8"),
};

export function getTokens(format: TokenFormat = "summary", filter?: string): Promise<string> {
  return getTokensFrom(nodeTokenFiles, format, filter);
}
