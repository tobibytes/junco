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
  Breadcrumb,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  EmptyState,
  Pagination,
  Sparkline,
  Stat,
  StatGroup,
} from "../src";
import { DataTable, type ColumnDef } from "../src/data-table";
import { Form, FormField, FormSubmit, useForm } from "../src/form";

type Row = { name: string; amount: number };
const rows: Row[] = [
  { name: "Northwind", amount: 1280 },
  { name: "Acme", amount: 640 },
];
const rowColumns: ColumnDef<Row>[] = [
  { accessorKey: "name", header: "Customer" },
  { accessorKey: "amount", header: "Amount", meta: { align: "right" } },
];

function ExampleForm() {
  const form = useForm({ defaultValues: { email: "", agree: false } });
  return (
    <Form form={form} onSubmit={() => {}}>
      <FormField name="email" label="Email" description="Work email">
        <Input />
      </FormField>
      <FormField name="agree" label="I agree">
        <Checkbox />
      </FormField>
      <FormSubmit>Save</FormSubmit>
    </Form>
  );
}

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

  it("has no violations across data, layout and form components", async () => {
    const { container } = render(
      <main>
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Reports", href: "/r" }, { label: "Q3" }]} />
        <Card>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <StatGroup>
              <Stat label="MRR" value="$48.2k" delta={4.1} chart={<Sparkline data={[1, 3, 2, 5, 4]} />} />
              <Stat label="Churn" value="2.1%" delta={-0.3} isInverse />
            </StatGroup>
          </CardContent>
          <CardFooter>
            <Button>View report</Button>
          </CardFooter>
        </Card>
        <Stat label="Visitors" value="12,031" delta="+3" trend="up" />
        <EmptyState title="No invoices" description="Invoices show up here." actions={<Button>New invoice</Button>} />
        <Pagination page={3} pageCount={12} onPageChange={() => {}} />
        <DataTable
          columns={rowColumns}
          data={rows}
          caption="Invoices"
          enableRowSelection
          enableGlobalFilter
          enableColumnVisibility
        />
        <DataTable columns={rowColumns} data={[]} caption="Empty invoices" />
        <ExampleForm />
      </main>,
    );
    expect(await violations(container)).toEqual([]);
  });
});
