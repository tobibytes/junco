#!/usr/bin/env node
/**
 * Junco CLI (stub). Planned commands:
 *   junco init                         set up tokens + Tailwind import + junco.config.ts
 *   junco add <component|block>        copy source from the registry into the project
 *   junco add page <name> [--variant]  copy a full page and everything it depends on
 *   junco diff <name>                  show upstream changes since it was copied
 *   junco update <name>                merge upstream changes, keeping local edits
 *   junco eject <name>                 turn an installed component into a local copy
 *   junco create <dir> --template <t>  start a new app from a template
 */
const [command, ...rest] = process.argv.slice(2);

const commands = ["init", "add", "diff", "update", "eject", "create"];

if (!command || !commands.includes(command)) {
  console.log(`junco <command>\n\nCommands: ${commands.join(", ")}`);
  process.exit(command ? 1 : 0);
}

console.log(`junco ${command} ${rest.join(" ")}: not built yet. See docs/ROADMAP.md.`);
