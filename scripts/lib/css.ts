/** A minimal CSS reader: enough for Junco's own token and theme files. */

export type CssNode =
  | { kind: "decl"; prop: string; value: string }
  | { kind: "statement"; text: string }
  | { kind: "block"; prelude: string; children: CssNode[] };

export function parseCss(input: string): CssNode[] {
  const css = input.replace(/\/\*[\s\S]*?\*\//g, "");
  let i = 0;

  function parseList(): CssNode[] {
    const nodes: CssNode[] = [];
    let buf = "";
    while (i < css.length) {
      const ch = css[i]!;
      if (ch === '"' || ch === "'") {
        const end = css.indexOf(ch, i + 1);
        buf += css.slice(i, end + 1);
        i = end + 1;
        continue;
      }
      if (ch === "(") {
        // keep parentheses (and anything inside, like `;` in url()) in the buffer
        let depth = 0;
        do {
          if (css[i] === "(") depth++;
          else if (css[i] === ")") depth--;
          buf += css[i];
          i++;
        } while (depth > 0 && i < css.length);
        continue;
      }
      if (ch === "{") {
        i++;
        nodes.push({ kind: "block", prelude: buf.trim().replace(/\s+/g, " "), children: parseList() });
        buf = "";
        continue;
      }
      if (ch === "}") {
        i++;
        pushText(nodes, buf);
        return nodes;
      }
      if (ch === ";") {
        i++;
        pushText(nodes, buf);
        buf = "";
        continue;
      }
      buf += ch;
      i++;
    }
    pushText(nodes, buf);
    return nodes;
  }

  return parseList();
}

function pushText(nodes: CssNode[], raw: string) {
  const text = raw.trim().replace(/\s+/g, " ");
  if (!text) return;
  if (text.startsWith("@")) {
    nodes.push({ kind: "statement", text });
    return;
  }
  const colon = text.indexOf(":");
  if (colon > 0) nodes.push({ kind: "decl", prop: text.slice(0, colon).trim(), value: text.slice(colon + 1).trim() });
}

/** shadcn's `css` field shape: nested selector/at-rule objects with string declarations. */
export type CssObject = { [key: string]: string | CssObject };

export function toCssObject(nodes: CssNode[]): CssObject {
  const out: CssObject = {};
  for (const node of nodes) {
    if (node.kind === "decl") out[node.prop] = node.value;
    else if (node.kind === "block") {
      const existing = out[node.prelude];
      const child = toCssObject(node.children);
      out[node.prelude] = typeof existing === "object" ? { ...existing, ...child } : child;
    }
  }
  return out;
}

export function serializeCss(nodes: CssNode[], indent = ""): string {
  return nodes
    .map((node) => {
      if (node.kind === "decl") return `${indent}${node.prop}: ${node.value};`;
      if (node.kind === "statement") return `${indent}${node.text};`;
      return `${indent}${node.prelude} {\n${serializeCss(node.children, indent + "  ")}\n${indent}}`;
    })
    .join("\n");
}
