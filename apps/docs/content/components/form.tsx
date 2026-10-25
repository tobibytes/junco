"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Checkbox,
  Input,
  Label,
  Radio,
  RadioGroup,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
  toast,
} from "@junco/react";
import { Form, FormField, FormRootError, FormSubmit, useForm } from "@junco/react/form";
import { z } from "zod";
import type { ComponentDoc } from "./types";

const schema = z.object({
  email: z.email("Enter a valid email"),
  role: z.enum(["engineer", "designer", "pm"], { message: "Pick a role" }),
  bio: z.string().max(80, "Keep it under 80 characters"),
  billing: z.enum(["monthly", "yearly"]),
  terms: z.literal(true, { message: "Accept the terms to continue" }),
  updates: z.boolean(),
});
type Values = z.infer<typeof schema>;

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function SignupForm() {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", role: undefined, bio: "", billing: "monthly", terms: false as unknown as true, updates: true },
  });
  return (
    <Form
      form={form}
      className="w-full max-w-md"
      onSubmit={async (values) => {
        await wait(800);
        if (values.email.endsWith("@taken.com")) {
          form.setError("root", { message: "That email already has an account. Try logging in." });
          return;
        }
        toast.success("Account created", { description: values.email });
        form.reset();
      }}
    >
      <FormRootError />
      <FormField name="email" label="Email" description="Try ada@taken.com to see a server error." isRequired>
        <Input type="email" placeholder="ada@example.com" />
      </FormField>
      <FormField name="role" label="Role">
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Pick one" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="engineer">Engineer</SelectItem>
            <SelectItem value="designer">Designer</SelectItem>
            <SelectItem value="pm">Product manager</SelectItem>
          </SelectContent>
        </Select>
      </FormField>
      <FormField name="bio" label="Bio">
        <Textarea autoResize placeholder="One line about you" />
      </FormField>
      <FormField name="billing" label="Billing">
        <RadioGroup orientation="horizontal">
          {(["monthly", "yearly"] as const).map((v) => (
            <div key={v} className="flex items-center gap-2">
              <Radio value={v} id={`billing-${v}`} />
              <Label htmlFor={`billing-${v}`} className="font-normal capitalize">
                {v}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </FormField>
      <FormField name="terms" label="I accept the terms">
        <Checkbox />
      </FormField>
      <FormField name="updates" label="Email me product updates">
        <Switch />
      </FormField>
      <FormSubmit>Create account</FormSubmit>
    </Form>
  );
}

export const doc: ComponentDoc = {
  imports: ["Form", "FormField", "FormSubmit", "FormRootError", "useForm"],
  importFrom: "@junco/react/form",
  installExtra: ["react-hook-form", "zod", "@hookform/resolvers"],
  usage: {
    installed: `import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@junco/react";

const schema = z.object({ email: z.email("Enter a valid email") });

function Signup() {
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { email: "" } });
  return (
    <Form form={form} onSubmit={save}>
      <FormField name="email" label="Email" description="We never share it.">
        <Input type="email" />
      </FormField>
      <FormSubmit>Save</FormSubmit>
    </Form>
  );
}`,
  },
  examples: [
    {
      title: "Sign-up form",
      description: "Submit it empty to see the errors. Every Junco control is wired automatically: labels, help text, errors and aria.",
      Preview: SignupForm,
      code: `const schema = z.object({
  email: z.email("Enter a valid email"),
  role: z.enum(["engineer", "designer", "pm"], { message: "Pick a role" }),
  bio: z.string().max(80, "Keep it under 80 characters"),
  billing: z.enum(["monthly", "yearly"]),
  terms: z.literal(true, { message: "Accept the terms to continue" }),
  updates: z.boolean(),
});

const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues });

<Form form={form} onSubmit={async (values) => {
  const res = await signUp(values);
  if (!res.ok) form.setError("root", { message: res.error });
}}>
  <FormRootError />
  <FormField name="email" label="Email" isRequired>
    <Input type="email" />
  </FormField>
  <FormField name="role" label="Role">
    <Select>
      <SelectTrigger><SelectValue placeholder="Pick one" /></SelectTrigger>
      <SelectContent>
        <SelectItem value="engineer">Engineer</SelectItem>
        …
      </SelectContent>
    </Select>
  </FormField>
  <FormField name="bio" label="Bio"><Textarea autoResize /></FormField>
  <FormField name="billing" label="Billing">
    <RadioGroup orientation="horizontal">
      <Radio value="monthly" id="monthly" /><Label htmlFor="monthly">Monthly</Label>
      <Radio value="yearly" id="yearly" /><Label htmlFor="yearly">Yearly</Label>
    </RadioGroup>
  </FormField>
  <FormField name="terms" label="I accept the terms"><Checkbox /></FormField>
  <FormField name="updates" label="Email me product updates"><Switch /></FormField>
  <FormSubmit>Create account</FormSubmit>
</Form>`,
    },
  ],
  props: [
    {
      component: "Form",
      description: "A <form> bound to react-hook-form. Also takes every <form> attribute.",
      props: [
        { name: "form", type: "UseFormReturn", description: "Required. The object from useForm()." },
        { name: "onSubmit", type: "(values) => void | Promise", description: "Required. Runs with valid values. FormSubmit shows a spinner while it's pending." },
        { name: "onError", type: "(errors) => void", description: "Runs when validation fails." },
      ],
    },
    {
      component: "FormField",
      description: "Renders Junco's Field (label, help text, error) around one control and binds it to the form.",
      props: [
        { name: "name", type: "string", description: "Required. Field name in the form values (typed)." },
        { name: "label", type: "ReactNode", description: "The label." },
        { name: "description", type: "ReactNode", description: "Help text under the control." },
        { name: "isRequired / isDisabled", type: "boolean", description: "Required marker and disabled state." },
        { name: "children", type: "ReactElement", description: "One Junco control: Input, Textarea, Select, Checkbox, Switch or RadioGroup." },
        { name: "render", type: "({ field, fieldState, groupProps }) => ReactElement", description: "For any other control. Spread groupProps on custom groups so the label names them." },
        { name: "layout", type: '"stacked" | "inline"', default: "inline for Checkbox and Switch", description: "Label above, or beside the control." },
      ],
    },
    {
      component: "FormSubmit",
      description: "A Junco Button with type=\"submit\". Takes every Button prop.",
      props: [{ name: "isLoading", type: "boolean", default: "while submitting", description: "Override the automatic loading state." }],
    },
    {
      component: "FormRootError",
      description: "Shows the error set with form.setError(\"root\", { message }), e.g. a failed request. Announced when it appears.",
      props: [{ name: "className", type: "string", description: "Extra classes." }],
    },
  ],
  keyboard: [
    { keys: ["Enter"], action: "Submits the form from a text field." },
    { keys: ["Tab"], action: "Moves between fields in order. After a failed submit, focus moves to the first invalid text field." },
  ],
  a11y: [
    "Errors are linked to their control with aria-describedby and set aria-invalid, so they're read with the field.",
    "Checkbox and Switch labels sit beside the control and are real <label>s you can click.",
    "Radio groups are named by the field label through aria-labelledby.",
    "Form-wide errors (FormRootError) are announced when they appear.",
  ],
};
