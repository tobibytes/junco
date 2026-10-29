import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import * as Y from "yjs";
import { Editor, editorText, type TiptapEditor } from "../src";

function mount(props: Partial<React.ComponentProps<typeof Editor>> = {}) {
  let editor: TiptapEditor | undefined;
  const view = render(<Editor {...props} onReady={(e) => (editor = e)} />);
  const get = async () => {
    await waitFor(() => expect(editor).toBeDefined());
    return editor!;
  };
  return { ...view, get };
}

describe("Editor", () => {
  it("formats the selection from the toolbar and reflects it", async () => {
    const user = userEvent.setup();
    const { get } = mount({ content: "<p>Hello world</p>" });
    const editor = await get();
    expect(screen.getByRole("textbox", { name: "Document" })).toHaveTextContent("Hello world");
    act(() => {
      editor.commands.setTextSelection({ from: 1, to: 6 });
    });
    await user.click(screen.getByRole("button", { name: "Bold" }));
    expect(editor.getHTML()).toBe("<p><strong>Hello</strong> world</p>");
    expect(screen.getByRole("button", { name: "Bold" })).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: "Heading 2" }));
    expect(editor.getHTML()).toMatch(/^<h2><strong>Hello<\/strong> world<\/h2>/);
  });

  it("turns '/' plus a word into a command menu, run with the keyboard", async () => {
    const { get } = mount({ content: "<p></p>" });
    const editor = await get();
    act(() => {
      editor.commands.focus();
      editor.commands.insertContent("/head");
    });
    const menu = await screen.findByRole("listbox", { name: "Commands" });
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["H1Heading 1", "H2Heading 2", "H3Heading 3"]);
    expect(menu).toBeInTheDocument();
    act(() => {
      editor.view.dom.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    });
    act(() => {
      editor.view.dom.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    });
    expect(editor.getHTML()).toMatch(/^<h2><\/h2>(<p><\/p>)?$/);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("closes the menu on Escape and leaves the text", async () => {
    const { get } = mount({ content: "<p></p>" });
    const editor = await get();
    act(() => {
      editor.commands.focus();
      editor.commands.insertContent("/qu");
    });
    await screen.findByRole("listbox");
    act(() => {
      editor.view.dom.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(editor.getText()).toBe("/qu");
  });

  it("edits one shared document from two editors, as two browsers would", async () => {
    const a = new Y.Doc();
    const b = new Y.Doc();
    a.on("update", (u: Uint8Array, origin: unknown) => origin !== "remote" && Y.applyUpdate(b, u, "remote"));
    b.on("update", (u: Uint8Array, origin: unknown) => origin !== "remote" && Y.applyUpdate(a, u, "remote"));
    const first = mount({ doc: a, label: "Ada's view" });
    const second = mount({ doc: b, label: "Bo's view" });
    const ea = await first.get();
    const eb = await second.get();
    act(() => {
      ea.commands.insertContent("<h1>Launch plan</h1><p>Ship on the 12th.</p>");
    });
    await waitFor(() => expect(eb.getHTML()).toContain("<h1>Launch plan</h1>"));
    act(() => {
      eb.commands.focus("end");
      eb.commands.insertContent(" Changelog the same day.");
    });
    await waitFor(() => expect(ea.getText()).toContain("Changelog the same day."));
    expect(editorText(a)).toBe("Launch plan\nShip on the 12th. Changelog the same day.");
    // Only your own changes undo.
    expect(screen.getAllByRole("button", { name: "Undo" })).toHaveLength(2);
  });

  it("is read-only without a toolbar when not editable", async () => {
    const { get } = mount({ content: "<p>Locked</p>", editable: false });
    const editor = await get();
    expect(editor.isEditable).toBe(false);
    expect(screen.queryByRole("toolbar")).not.toBeInTheDocument();
  });
});
