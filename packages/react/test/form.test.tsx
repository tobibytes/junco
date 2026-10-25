import { zodResolver } from "@hookform/resolvers/zod";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import {
  Checkbox,
  Input,
  Radio,
  RadioGroup,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
} from "../src";
import { Form, FormField, FormRootError, FormSubmit, useForm } from "../src/form";

const schema = z.object({
  email: z.email("Enter a valid email"),
  bio: z.string().max(20, "Keep it under 20 characters"),
  plan: z.enum(["free", "pro"], { message: "Pick a plan" }),
  billing: z.enum(["monthly", "yearly"]),
  terms: z.literal(true, { message: "You must accept the terms" }),
  notify: z.boolean(),
});
type Values = z.infer<typeof schema>;

function SignupForm({ onSubmit, failWith }: { onSubmit: (v: Values) => void; failWith?: string }) {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", bio: "", plan: undefined, billing: "monthly", terms: false as unknown as true, notify: false },
  });
  return (
    <Form
      form={form}
      onSubmit={async (values) => {
        if (failWith) {
          form.setError("root", { message: failWith });
          return;
        }
        onSubmit(values);
      }}
    >
      <FormRootError />
      <FormField name="email" label="Email" description="We never share it" isRequired>
        <Input type="email" />
      </FormField>
      <FormField name="bio" label="Bio">
        <Textarea />
      </FormField>
      <FormField name="plan" label="Plan">
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Pick one" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="pro">Pro</SelectItem>
          </SelectContent>
        </Select>
      </FormField>
      <FormField name="billing" label="Billing">
        <RadioGroup>
          <Radio value="monthly" aria-label="Monthly" />
          <Radio value="yearly" aria-label="Yearly" />
        </RadioGroup>
      </FormField>
      <FormField name="terms" label="Accept terms">
        <Checkbox />
      </FormField>
      <FormField name="notify" label="Email me updates">
        <Switch />
      </FormField>
      <FormSubmit>Create account</FormSubmit>
    </Form>
  );
}

describe("Form + Zod", () => {
  it("shows every error, wired to its control, and focuses the first invalid field", async () => {
    const onSubmit = vi.fn();
    render(<SignupForm onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole("button", { name: "Create account" }));

    const email = screen.getByRole("textbox", { name: /Email/ });
    await waitFor(() => expect(email).toHaveAttribute("aria-invalid", "true"));
    expect(email).toHaveAccessibleDescription("We never share it Enter a valid email");
    expect(email).toHaveFocus();
    expect(screen.getByRole("checkbox", { name: "Accept terms" })).toHaveAccessibleDescription("You must accept the terms");
    expect(screen.getByRole("combobox", { name: "Plan" })).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Pick a plan")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("clears an error once the field is fixed and resubmitted", async () => {
    render(<SignupForm onSubmit={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "Create account" }));
    expect(await screen.findByText("Enter a valid email")).toBeInTheDocument();
    await userEvent.type(screen.getByRole("textbox", { name: /Email/ }), "ada@example.com");
    await waitFor(() => expect(screen.queryByText("Enter a valid email")).toBeNull());
  });

  it("submits typed values from every kind of control", async () => {
    const onSubmit = vi.fn();
    render(<SignupForm onSubmit={onSubmit} />);
    await userEvent.type(screen.getByRole("textbox", { name: /Email/ }), "ada@example.com");
    await userEvent.type(screen.getByRole("textbox", { name: "Bio" }), "Hi");
    await userEvent.click(screen.getByRole("combobox", { name: "Plan" }));
    await userEvent.click(await screen.findByRole("option", { name: "Pro" }));
    await userEvent.click(screen.getByRole("radio", { name: "Yearly" }));
    await userEvent.click(screen.getByRole("checkbox", { name: "Accept terms" }));
    await userEvent.click(screen.getByRole("switch", { name: "Email me updates" }));
    await userEvent.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onSubmit.mock.calls[0]![0]).toEqual({
      email: "ada@example.com",
      bio: "Hi",
      plan: "pro",
      billing: "yearly",
      terms: true,
      notify: true,
    });
  });

  it("names a RadioGroup by its field label", () => {
    render(<SignupForm onSubmit={vi.fn()} />);
    expect(screen.getByRole("radiogroup", { name: "Billing" })).toBeInTheDocument();
  });

  it("shows a form-wide error from setError('root')", async () => {
    render(<SignupForm onSubmit={vi.fn()} failWith="Server is down, try again" />);
    await userEvent.type(screen.getByRole("textbox", { name: /Email/ }), "ada@example.com");
    await userEvent.click(screen.getByRole("combobox", { name: "Plan" }));
    await userEvent.click(await screen.findByRole("option", { name: "Free" }));
    await userEvent.click(screen.getByRole("checkbox", { name: "Accept terms" }));
    await userEvent.click(screen.getByRole("button", { name: "Create account" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Server is down, try again");
  });
});
