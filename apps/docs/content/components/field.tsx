"use client";

import {
  Button,
  Checkbox,
  Field,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@junco/react";
import * as React from "react";
import type { ComponentDoc } from "./types";

function SignupForm() {
  const [submitted, setSubmitted] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const emailError = submitted && !/^\S+@\S+\.\S+$/.test(email) ? "Enter an email like you@company.com." : undefined;
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
      className="grid w-full max-w-sm gap-4"
    >
      <Field label="Work email" description="We'll send a sign-in link." error={emailError} isRequired>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
      </Field>
      <Field label="Role">
        <Select defaultValue="eng">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="eng">Engineering</SelectItem>
            <SelectItem value="design">Design</SelectItem>
            <SelectItem value="product">Product</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field label="What are you building?" description="Optional.">
        <Textarea autoResize />
      </Field>
      <Button type="submit" className="justify-self-start">
        Create account
      </Button>
    </form>
  );
}

export const doc: ComponentDoc = {
  imports: ["Field", "Input"],
  playground: {
    controls: [
      { name: "label", type: "text", default: "Email" },
      { name: "description", type: "text", default: "Use your work email." },
      { name: "error", type: "text", default: "" },
      { name: "isRequired", type: "boolean", default: false },
      { name: "isDisabled", type: "boolean", default: false },
    ],
    render: (v) => (
      <div className="w-full max-w-xs">
        <Field
          label={String(v.label)}
          description={String(v.description) || undefined}
          error={String(v.error) || undefined}
          isRequired={v.isRequired as boolean}
          isDisabled={v.isDisabled as boolean}
        >
          <Input placeholder="you@example.com" />
        </Field>
      </div>
    ),
    code: (v) => {
      const attrs = [
        `label="${v.label}"`,
        v.description && `description="${v.description}"`,
        v.error && `error="${v.error}"`,
        v.isRequired && "isRequired",
        v.isDisabled && "isDisabled",
      ].filter(Boolean);
      return `<Field ${attrs.join(" ")}>
  <Input placeholder="you@example.com" />
</Field>`;
    },
  },
  usage: {
    installed: `<Field label="Email" description="Use your work email." error={errors.email} isRequired>
  <Input type="email" />
</Field>`,
    semantic: `<div class="field">
  <label class="label" for="email">Email</label>
  <input id="email" class="input" aria-describedby="email-help email-error" aria-invalid="true" required />
  <p id="email-help" class="field-help">Use your work email.</p>
  <p id="email-error" class="field-error">Enter a valid email.</p>
</div>`,
  },
  examples: [
    {
      title: "A whole form",
      description: "Every control picks up its id, label, help text and error from the Field around it. Submit empty to see the error.",
      Preview: SignupForm,
      code: `<Field label="Work email" description="We'll send a sign-in link." error={emailError} isRequired>
  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
</Field>
<Field label="Role">
  <Select defaultValue="eng">...</Select>
</Field>
<Field label="What are you building?" description="Optional.">
  <Textarea autoResize />
</Field>`,
    },
    {
      title: "Checkbox in a field",
      Preview: () => (
        <Field label="Subscribe to the changelog" className="flex flex-row-reverse items-center justify-end gap-2">
          <Checkbox />
        </Field>
      ),
      code: `<Field label="Subscribe to the changelog" className="flex flex-row-reverse items-center justify-end gap-2">
  <Checkbox />
</Field>`,
    },
  ],
  props: [
    {
      component: "Field",
      props: [
        { name: "label", type: "ReactNode", description: "Rendered as a <label> pointing at the control." },
        { name: "description", type: "ReactNode", description: "Help text under the control, linked with aria-describedby." },
        { name: "error", type: "ReactNode", description: "Error message. Setting it marks the control invalid and links the message." },
        { name: "isRequired", type: "boolean", default: "false", description: "Shows a marker and sets required on the control." },
        { name: "isDisabled", type: "boolean", default: "false", description: "Disables the control and dims the label." },
        { name: "id", type: "string", description: "Id for the control. Generated when omitted." },
        { name: "classNames", type: "{ root?, label?, description?, error? }", description: "Slot overrides." },
      ],
    },
    {
      component: "useFieldControl",
      description: "For your own controls: pass your props through it to pick up the Field wiring.",
      props: [{ name: "props", type: "{ id?, disabled?, required?, aria-describedby?, aria-invalid? }", description: "Props on the control win over the Field's." }],
    },
  ],
  a11y: [
    "Label, help text and error are connected with htmlFor and aria-describedby automatically, so they're read with the control.",
    "The error region is polite-live, so new errors are announced without stealing focus.",
    "Required is set on the control itself, not just shown as an asterisk.",
  ],
};
