import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Input,
  Label,
  Radio,
  RadioGroup,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  toast,
} from "@junco/react";
import { Form, FormField, FormSubmit, useForm, useWatch } from "@junco/react/form";
import { z } from "zod";
import { CATEGORIES, todayIso, usd, type CategoryId } from "./data";
import { useLedger } from "./store";

const schema = z
  .object({
    type: z.enum(["expense", "income"]),
    description: z.string().trim().min(2, "Add a short description, like “Trader Joe's”"),
    amount: z
      .string()
      .trim()
      .min(1, "Enter an amount")
      .refine((v) => /^\d+(\.\d{1,2})?$/.test(v.replace(/[$,]/g, "")), "Use a number like 24.50")
      .refine((v) => Number(v.replace(/[$,]/g, "")) > 0, "The amount has to be more than $0"),
    category: z.string().min(1, "Pick a category"),
    accountId: z.string().min(1, "Pick an account"),
    date: z
      .string()
      .min(1, "Pick a date")
      .refine((v) => v <= todayIso(), "Transactions can't be in the future"),
  })
  .refine((v) => (v.type === "income" ? v.category === "income" : v.category !== "income"), {
    path: ["category"],
    message: "Income goes in the Income category",
  });

type Values = z.infer<typeof schema>;

const DEFAULTS: Values = { type: "expense", description: "", amount: "", category: "groceries", accountId: "card", date: todayIso() };

export function AddTransactionSheet() {
  const { addOpen, setAddOpen, addTransaction, removeTransaction, accounts } = useLedger();
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: DEFAULTS });
  const type = useWatch({ control: form.control, name: "type" });

  // Keep the category sensible when switching between spending and income.
  React.useEffect(() => {
    const cat = form.getValues("category");
    if (type === "income" && cat !== "income") form.setValue("category", "income");
    if (type === "expense" && cat === "income") form.setValue("category", "groceries");
  }, [type, form]);

  const submit = (v: Values) => {
    const amount = Number(v.amount.replace(/[$,]/g, ""));
    const tx = addTransaction({
      description: v.description.trim(),
      amount: v.type === "income" ? amount : -amount,
      category: v.category as CategoryId,
      accountId: v.accountId,
      date: v.date,
    });
    toast.success(v.type === "income" ? "Income added" : "Expense added", {
      description: `${v.description.trim()} · ${usd(tx.amount, { sign: true })}`,
      action: { label: "Undo", onClick: () => removeTransaction(tx.id) },
    });
    form.reset(DEFAULTS);
    setAddOpen(false);
  };

  return (
    <Sheet
      open={addOpen}
      onOpenChange={(open) => {
        setAddOpen(open);
        if (!open) form.reset(DEFAULTS);
      }}
    >
      <SheetContent className="w-[min(26rem,calc(100vw-3rem))]">
        <SheetHeader>
          <SheetTitle>Add a transaction</SheetTitle>
          <SheetDescription>It shows up in your budgets and charts right away.</SheetDescription>
        </SheetHeader>
        <Form form={form} onSubmit={submit} className="flex flex-1 flex-col gap-4">
          <FormField name="type" label="Type">
            <RadioGroup orientation="horizontal" className="grid grid-cols-2 gap-2">
              {(["expense", "income"] as const).map((t) => (
                <Label
                  key={t}
                  htmlFor={`type-${t}`}
                  className="flex h-10 cursor-pointer items-center gap-2.5 rounded-card border border-border px-3 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
                >
                  <Radio id={`type-${t}`} value={t} />
                  {t === "expense" ? "Spending" : "Income"}
                </Label>
              ))}
            </RadioGroup>
          </FormField>
          <FormField name="description" label="Description">
            <Input placeholder="e.g. Trader Joe's" autoComplete="off" />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField name="amount" label="Amount">
              <Input inputMode="decimal" placeholder="0.00" autoComplete="off" />
            </FormField>
            <FormField name="date" label="Date">
              <Input type="date" max={todayIso()} />
            </FormField>
          </div>
          <FormField name="category" label="Category">
            <Select>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.filter((c) => (type === "income" ? c.id === "income" : c.id !== "income")).map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField name="accountId" label="Account">
            <Select>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name} · {a.institution}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <SheetFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <FormSubmit>Add transaction</FormSubmit>
          </SheetFooter>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
