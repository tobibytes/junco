import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    // Node 25+ ships its own localStorage global, which hides jsdom's. Turn it off in the test workers.
    poolOptions: { forks: { execArgv: ["--no-experimental-webstorage"] } },
    setupFiles: ["./test/setup.ts"],
  },
});
