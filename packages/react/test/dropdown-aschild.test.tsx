import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../src";

describe("DropdownMenuItem asChild", () => {
  it("renders the child element as the item, with or without a shortcut", async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>Open</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem asChild>
            <a href="/profile">Profile</a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild shortcut="⌘S">
            <a href="/settings">Settings</a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    const profile = await screen.findByRole("menuitem", { name: "Profile" });
    expect(profile.tagName).toBe("A");
    expect(profile).toHaveAttribute("href", "/profile");
    const settings = screen.getByRole("menuitem", { name: /Settings/ });
    expect(settings.tagName).toBe("A");
    expect(settings).toHaveTextContent("⌘S");
  });
});
