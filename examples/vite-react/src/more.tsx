import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
  Field,
  Input,
  Kbd,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Sparkline,
  Stat,
  StatGroup,
  toast,
} from "junco";
import { DataTable, type ColumnDef } from "junco/data-table";
import { useState } from "react";

export function OverlaysDemo() {
  const [commandOpen, setCommandOpen] = useState(false);
  return (
    <div className="flex flex-wrap gap-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename project</DialogTitle>
            <DialogDescription>This changes the name for everyone on the team.</DialogDescription>
          </DialogHeader>
          <Field label="Name">
            <Input defaultValue="Junco" />
          </Field>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button onClick={() => toast.success("Project renamed")}>Save</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Sheet</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>On phones this becomes a bottom sheet you can swipe down.</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Project</DropdownMenuLabel>
          <DropdownMenuItem>
            Duplicate <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>Share</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="danger">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Popover</Button>
        </PopoverTrigger>
        <PopoverContent>
          <p className="text-sm font-medium">Popover</p>
          <p className="mt-1 text-sm text-muted-foreground">For small bits of extra UI.</p>
        </PopoverContent>
      </Popover>

      <Button variant="outline" onClick={() => setCommandOpen(true)}>
        Search <Kbd>⌘K</Kbd>
      </Button>
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Search pages and actions" />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          <CommandGroup heading="Pages">
            <CommandItem>Dashboard</CommandItem>
            <CommandItem>Invoices</CommandItem>
            <CommandItem>Settings</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      <Button
        variant="outline"
        onClick={() =>
          toast.promise(new Promise((r) => setTimeout(r, 1200)), {
            loading: "Sending invoice",
            success: "Invoice sent",
            error: "Couldn't send",
          })
        }
      >
        Toast
      </Button>
    </div>
  );
}

type Customer = { name: string; plan: string; mrr: number; seats: number };
const customers: Customer[] = [
  { name: "Northwind", plan: "Business", mrr: 1280, seats: 24 },
  { name: "Acme Co", plan: "Pro", mrr: 640, seats: 9 },
  { name: "Globex", plan: "Business", mrr: 2115, seats: 41 },
  { name: "Initech", plan: "Starter", mrr: 89, seats: 3 },
  { name: "Umbrella", plan: "Pro", mrr: 512, seats: 7 },
  { name: "Hooli", plan: "Enterprise", mrr: 8400, seats: 160 },
];
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const columns: ColumnDef<Customer>[] = [
  { accessorKey: "name", header: "Customer" },
  { accessorKey: "plan", header: "Plan" },
  { accessorKey: "seats", header: "Seats", meta: { align: "right" } },
  { accessorKey: "mrr", header: "MRR", meta: { align: "right" }, cell: ({ getValue }) => money.format(getValue<number>()) },
];

export function DataDemo() {
  return (
    <div className="grid gap-4">
      <StatGroup>
        <Stat label="MRR" value="$13,036" delta="+8.2%" trend="up" deltaLabel="vs last month" chart={<Sparkline data={[4, 6, 5, 8, 7, 9, 12]} />} />
        <Stat label="Churn" value="1.9%" delta="-0.4%" trend="down" isInverse deltaLabel="vs last month" />
        <Stat label="Seats" value="244" delta="+12" trend="up" />
      </StatGroup>
      <Card>
        <CardHeader>
          <CardTitle>Customers</CardTitle>
          <CardDescription>Sort, search, pick rows, hide columns.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={customers}
            caption="Customers"
            getRowId={(r) => r.name}
            enableRowSelection
            enableGlobalFilter
            enableColumnVisibility
            pageSize={5}
          />
        </CardContent>
      </Card>
    </div>
  );
}
