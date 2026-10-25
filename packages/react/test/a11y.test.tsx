import { render } from "@testing-library/react";
import axe from "axe-core";
import { describe, expect, it } from "vitest";
import {
  Avatar,
  Badge,
  Button,
  Checkbox,
  Field,
  Input,
  Kbd,
  Label,
  Radio,
  RadioGroup,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Skeleton,
  Spinner,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from "../src";

async function violations(container: HTMLElement) {
  // Color contrast needs real layout and is covered by the token contrast test instead.
  const result = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
  return result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.html).join(", ")}`);
}

describe("accessibility (axe)", () => {
  it("catches real problems (guards against a silently passing setup)", async () => {
    const { container } = render(
      <main>
        <Button size="icon">+</Button>
        <Switch />
      </main>,
    );
    const found = await violations(container);
    expect(found.some((v) => v.startsWith("button-name"))).toBe(true);
  });

  it("has no violations across the component set", async () => {
    const { container } = render(
      <main>
        <Button>Save</Button>
        <Button isLoading>Saving</Button>
        <Button size="icon" aria-label="Add">+</Button>
        <Badge hasDot color="success">Paid</Badge>
        <Kbd>K</Kbd>
        <Spinner />
        <Skeleton className="h-4 w-20" />
        <Separator />
        <Avatar name="Ada Lovelace" />
        <Field label="Email" description="Work email" error="Required" isRequired>
          <Input />
        </Field>
        <Field label="Bio">
          <Textarea />
        </Field>
        <Field label="Plan">
          <Select defaultValue="free">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="free">Free</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <div className="flex gap-2">
          <Checkbox id="terms" />
          <Label htmlFor="terms">Accept terms</Label>
        </div>
        <div className="flex gap-2">
          <Switch id="notify" />
          <Label htmlFor="notify">Notifications</Label>
        </div>
        <RadioGroup aria-label="Billing" defaultValue="monthly">
          <div className="flex gap-2">
            <Radio value="monthly" id="monthly" />
            <Label htmlFor="monthly">Monthly</Label>
          </div>
          <div className="flex gap-2">
            <Radio value="yearly" id="yearly" />
            <Label htmlFor="yearly">Yearly</Label>
          </div>
        </RadioGroup>
        <Tabs defaultValue="a">
          <TabsList aria-label="Sections">
            <TabsTrigger value="a">One</TabsTrigger>
            <TabsTrigger value="b">Two</TabsTrigger>
          </TabsList>
          <TabsContent value="a">First</TabsContent>
          <TabsContent value="b">Second</TabsContent>
        </Tabs>
      </main>,
    );
    expect(await violations(container)).toEqual([]);
  });
});
