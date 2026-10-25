import { parseArgs } from "node:util";
import { add, CliError, diff, eject, init, list, update, type Io } from "./commands";

export const VERSION = "0.0.0";

const HELP = `junco: copy Junco components into your project and keep them updated.

Usage
  junco init [--css package|inline] [--css-file <path>] [--yes] [--force]
  junco add <name...> [--overwrite]
  junco diff [name...]           show upstream changes (no name: list items with updates)
  junco update [name...] [--force] [--resolved] [--all]
  junco list [--installed]
  junco eject <name>

Options
  --registry <url|dir>   registry to read (also JUNCO_REGISTRY, or "registry" in junco.json)
  --cwd <dir>            project folder (default: current folder)
  --no-install           don't run the package manager; print the command instead
  -h, --help             show this help
  -v, --version          show the version
`;

export async function run(argv: string[], io: Partial<Io> = {}): Promise<number> {
  const out = io.out ?? ((line: string) => console.log(line));
  const err = io.err ?? ((line: string) => console.error(line));
  let parsed;
  try {
    parsed = parseArgs({
      args: argv,
      allowPositionals: true,
      options: {
        registry: { type: "string" },
        cwd: { type: "string" },
        css: { type: "string" },
        "css-file": { type: "string" },
        "no-install": { type: "boolean" },
        yes: { type: "boolean", short: "y" },
        force: { type: "boolean", short: "f" },
        overwrite: { type: "boolean", short: "o" },
        resolved: { type: "boolean" },
        all: { type: "boolean" },
        installed: { type: "boolean" },
        help: { type: "boolean", short: "h" },
        version: { type: "boolean", short: "v" },
      },
    });
  } catch (e) {
    err((e as Error).message);
    err("Run `junco --help` for usage.");
    return 1;
  }
  const { values, positionals } = parsed;
  const [command, ...names] = positionals;

  if (values.version) {
    out(VERSION);
    return 0;
  }
  if (values.help || !command) {
    out(HELP);
    return command || values.help ? 0 : 1;
  }

  const ctx: Io = {
    cwd: values.cwd ?? io.cwd ?? process.cwd(),
    out,
    err,
    install: io.install ?? !values["no-install"],
    interactive: io.interactive ?? (Boolean(process.stdin.isTTY) && !values.yes),
    registry: values.registry ?? io.registry ?? process.env.JUNCO_REGISTRY,
  };

  try {
    switch (command) {
      case "init": {
        const css = values.css;
        if (css !== undefined && css !== "package" && css !== "inline") throw new CliError("--css must be package or inline");
        await init(ctx, { css, cssFile: values["css-file"], force: values.force, yes: values.yes });
        break;
      }
      case "add":
        await add(ctx, names, { overwrite: values.overwrite });
        break;
      case "diff":
        await diff(ctx, names);
        break;
      case "update":
        await update(ctx, names, { force: values.force, resolved: values.resolved, all: values.all });
        break;
      case "list":
      case "ls":
        await list(ctx, { installed: values.installed });
        break;
      case "eject":
        eject(ctx);
        break;
      default:
        err(`Unknown command "${command}".\n`);
        out(HELP);
        return 1;
    }
    return 0;
  } catch (e) {
    err(e instanceof CliError ? e.message : `Error: ${(e as Error).message}`);
    return 1;
  }
}
