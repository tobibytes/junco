import { describe, expect, it } from "vitest";
import { tokenize, type TokenType } from "../lib/highlight";

const typeOf = (code: string, text: string): TokenType | undefined =>
  tokenize(code, "tsx").find((t) => t.text.includes(text))?.type;

describe("tokenize tsx", () => {
  it("leaves the text between JSX tags plain", () => {
    const code = `<DialogDescription>
  This can't be undone. It will delete it as new.
</DialogDescription>`;
    const tokens = tokenize(code, "tsx");
    expect(tokens.filter((t) => t.type !== "plain" && t.type !== "tag").map((t) => t.text)).toEqual([]);
    expect(tokens.map((t) => t.text).join("")).toBe(code);
  });

  it("still colors code inside JSX: tags, attributes, strings and expressions", () => {
    const code = `export function Demo() {
  return (
    <Button variant="ghost" onClick={() => setOpen(true)}>
      Delete {count > 1 ? "items" : "item"}
    </Button>
  );
}`;
    expect(typeOf(code, "export")).toBe("keyword");
    expect(typeOf(code, "Button")).toBe("tag");
    expect(typeOf(code, "variant")).toBe("attr");
    expect(typeOf(code, '"ghost"')).toBe("string");
    expect(typeOf(code, "true")).toBe("keyword");
    expect(typeOf(code, "Delete")).toBe("plain");
    expect(typeOf(code, '"items"')).toBe("string");
    expect(tokenize(code, "tsx").map((t) => t.text).join("")).toBe(code);
  });

  it("handles nested JSX, fragments and JSX inside expressions", () => {
    const code = `<>
  <Card>Title</Card>
  {items.map((item) => <Row key={item.id}>Open It</Row>)}
  <Input />
  Done
</>`;
    expect(typeOf(code, "Title")).toBe("plain");
    expect(typeOf(code, "Open It")).toBe("plain");
    expect(typeOf(code, "Done")).toBe("plain");
    expect(typeOf(code, "key")).toBe("attr");
  });

  it("doesn't mistake generics or comparisons for JSX", () => {
    const code = `const [value, setValue] = useState<string>("");
if (a < b && c > d) return Number(value);`;
    expect(typeOf(code, '""')).toBe("string");
    expect(typeOf(code, "return")).toBe("keyword");
    expect(typeOf(code, "Number")).toBe("type");
  });
});
