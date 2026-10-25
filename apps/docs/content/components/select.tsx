"use client";

import {
  Field,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "junco";
import type { ComponentDoc } from "./types";

const timezones = (
  <SelectContent>
    <SelectGroup>
      <SelectLabel>Americas</SelectLabel>
      <SelectItem value="est">Eastern (EST)</SelectItem>
      <SelectItem value="cst">Central (CST)</SelectItem>
      <SelectItem value="pst">Pacific (PST)</SelectItem>
    </SelectGroup>
    <SelectSeparator />
    <SelectGroup>
      <SelectLabel>Europe</SelectLabel>
      <SelectItem value="gmt">London (GMT)</SelectItem>
      <SelectItem value="cet">Berlin (CET)</SelectItem>
    </SelectGroup>
  </SelectContent>
);

export const doc: ComponentDoc = {
  imports: ["Select", "SelectTrigger", "SelectValue", "SelectContent", "SelectItem"],
  playground: {
    controls: [
      { name: "size", type: "select", options: ["sm", "md", "lg"], default: "md" },
      { name: "isInvalid", type: "boolean", default: false },
      { name: "disabled", type: "boolean", default: false },
    ],
    render: (v) => (
      <div className="w-full max-w-xs">
        <Select disabled={v.disabled as boolean}>
          <SelectTrigger size={v.size as "md"} isInvalid={v.isInvalid as boolean} aria-label="Frequency">
            <SelectValue placeholder="Pick a frequency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>
    ),
    code: (v) => {
      const trigger = [v.size !== "md" && `size="${v.size}"`, v.isInvalid && "isInvalid"].filter(Boolean);
      return `<Select${v.disabled ? " disabled" : ""}>
  <SelectTrigger${trigger.length ? " " + trigger.join(" ") : ""}>
    <SelectValue placeholder="Pick a frequency" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="daily">Daily</SelectItem>
    <SelectItem value="weekly">Weekly</SelectItem>
    <SelectItem value="monthly">Monthly</SelectItem>
  </SelectContent>
</Select>`;
    },
  },
  usage: {
    installed: `<Field label="Frequency">
  <Select defaultValue="weekly">
    <SelectTrigger>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="daily">Daily</SelectItem>
      <SelectItem value="weekly">Weekly</SelectItem>
    </SelectContent>
  </Select>
</Field>`,
    semantic: `<!-- A styled native <select>: no JavaScript, native mobile pickers -->
<label class="label" for="freq">Frequency</label>
<select id="freq" class="select">
  <option>Daily</option>
  <option selected>Weekly</option>
</select>`,
  },
  examples: [
    {
      title: "Groups",
      description: "Group long lists with SelectGroup, SelectLabel and SelectSeparator.",
      Preview: () => (
        <div className="w-full max-w-xs">
          <Field label="Timezone">
            <Select defaultValue="est">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              {timezones}
            </Select>
          </Field>
        </div>
      ),
      code: `<Select defaultValue="est">
  <SelectTrigger><SelectValue /></SelectTrigger>
  <SelectContent>
    <SelectGroup>
      <SelectLabel>Americas</SelectLabel>
      <SelectItem value="est">Eastern (EST)</SelectItem>
      ...
    </SelectGroup>
    <SelectSeparator />
    <SelectGroup>
      <SelectLabel>Europe</SelectLabel>
      ...
    </SelectGroup>
  </SelectContent>
</Select>`,
    },
    {
      title: "In a form field",
      description: "Field labels the trigger and links the error to it.",
      Preview: () => (
        <div className="w-full max-w-xs">
          <Field label="Plan" error="Pick a plan to continue." isRequired>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Choose a plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="team">Team</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      ),
      code: `<Field label="Plan" error="Pick a plan to continue." isRequired>
  <Select>
    <SelectTrigger><SelectValue placeholder="Choose a plan" /></SelectTrigger>
    <SelectContent>...</SelectContent>
  </Select>
</Field>`,
    },
  ],
  props: [
    {
      component: "Select",
      props: [
        { name: "value / defaultValue", type: "string", description: "Controlled or initial value." },
        { name: "onValueChange", type: "(value: string) => void", description: "Called when the user picks an option." },
        { name: "disabled", type: "boolean", default: "false", description: "Disables the whole select." },
        { name: "name", type: "string", description: "Form field name, for native form submission." },
      ],
    },
    {
      component: "SelectTrigger",
      props: [
        { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Matches Input sizes." },
        { name: "isInvalid", type: "boolean", default: "false", description: "Sets aria-invalid and the error border." },
      ],
    },
    {
      component: "SelectItem",
      props: [
        { name: "value", type: "string", description: "Required. The value reported when picked." },
        { name: "disabled", type: "boolean", default: "false", description: "Skipped by the keyboard and not selectable." },
      ],
    },
  ],
  keyboard: [
    { keys: ["Space"], action: "Opens the list when the trigger is focused, or picks the highlighted option." },
    { keys: ["Enter"], action: "Opens the list, or picks the highlighted option." },
    { keys: ["↑", "↓"], action: "Moves the highlight." },
    { keys: ["Esc"], action: "Closes the list and returns focus to the trigger." },
    { keys: ["A–Z"], action: "Typeahead: jumps to the first option starting with that letter." },
  ],
  a11y: [
    "Follows the WAI-ARIA listbox pattern via Radix: the trigger is a combobox and options announce their selected state.",
    "Give the trigger a label with Field, a Label, or aria-label.",
    "The semantic-class version is a real <select>, which keeps native pickers on phones.",
  ],
};
