import { CheckIcon } from "../icons";

type Cell = boolean | string;

const columns = ["Junco", "shadcn/ui", "Tailwind Plus"];

const rows: [string, Cell, Cell, Cell][] = [
  ["Price", "Free, MIT", "Free, MIT", "Paid"],
  ["Copy-in source", true, true, true],
  ["npm package", true, false, false],
  ["Works without React", "CSS classes", false, "HTML snippets"],
  ["Update copied code, keep your edits", true, false, false],
  ["Pages with typed data and slots", true, false, false],
  ["Contrast tested on every token", true, false, false],
  ["SwiftUI", true, false, false],
  ["MCP server for AI agents", true, true, false],
];

function Value({ value }: { value: Cell }) {
  if (value === true)
    return (
      <>
        <CheckIcon width={16} height={16} aria-hidden className="text-foreground" />
        <span className="sr-only">Yes</span>
      </>
    );
  if (value === false)
    return (
      <span className="text-muted-foreground">
        <span aria-hidden>–</span>
        <span className="sr-only">No</span>
      </span>
    );
  return <span>{value}</span>;
}

/** Junco next to the two libraries people compare it with. */
export function Compare() {
  return (
    <div
      tabIndex={0}
      role="region"
      aria-label="Comparison"
      className="relative overflow-x-auto rounded-card border border-border bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <table className="w-full min-w-[34rem] text-left text-sm">
        <caption className="sr-only">Junco compared with shadcn/ui and Tailwind Plus</caption>
        <thead className="border-b border-border bg-surface">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
              <span className="sr-only">Feature</span>
            </th>
            {columns.map((c, i) => (
              <th key={c} scope="col" className={i === 0 ? "px-4 py-3 font-semibold" : "px-4 py-3 font-medium text-muted-foreground"}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map(([label, ...cells]) => (
            <tr key={label}>
              <th scope="row" className="px-4 py-3 font-normal text-muted-foreground">
                {label}
              </th>
              {cells.map((cell, i) => (
                <td key={i} className={i === 0 ? "bg-primary/5 px-4 py-3 font-medium" : "px-4 py-3"}>
                  <Value value={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
