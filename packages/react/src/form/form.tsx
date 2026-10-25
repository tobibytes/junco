import * as React from "react";
import {
  FormProvider,
  useController,
  useFormContext,
  type ControllerFieldState,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
  type SubmitErrorHandler,
  type SubmitHandler,
  type UseFormReturn,
} from "react-hook-form";
import { Button, type ButtonProps } from "../components/button";
import { Checkbox } from "../components/checkbox";
import { Field, type FieldProps } from "../components/field";
import { Label } from "../components/label";
import { RadioGroup } from "../components/radio-group";
import { Select } from "../components/select";
import { Switch } from "../components/switch";
import { cn } from "../lib/cn";

export interface FormProps<TValues extends FieldValues>
  extends Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit" | "onError"> {
  /** The object from `useForm()`. */
  form: UseFormReturn<TValues>;
  onSubmit: SubmitHandler<TValues>;
  onError?: SubmitErrorHandler<TValues>;
}

/**
 * React Hook Form + Zod integration: FormField wires labels, help text and errors to any Junco control.
 *
 *   const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues });
 *   <Form form={form} onSubmit={save}>
 *     <FormField name="email" label="Email"><Input type="email" /></FormField>
 *     <FormSubmit>Save</FormSubmit>
 *   </Form>
 */
export function Form<TValues extends FieldValues>({ form, onSubmit, onError, className, children, ...props }: FormProps<TValues>) {
  return (
    <FormProvider {...form}>
      <form
        noValidate
        onSubmit={form.handleSubmit(onSubmit, onError)}
        className={cn("grid gap-5", className)}
        {...props}
      >
        {children}
      </form>
    </FormProvider>
  );
}

type Kind = "checked" | "value" | "event";

function kindOf(child: React.ReactElement): Kind {
  if (child.type === Checkbox || child.type === Switch) return "checked";
  if (child.type === Select || child.type === RadioGroup) return "value";
  return "event";
}

export interface FormFieldRenderProps<TValues extends FieldValues, TName extends FieldPath<TValues>> {
  field: ControllerRenderProps<TValues, TName>;
  fieldState: ControllerFieldState;
  /** Spread on a RadioGroup or other custom group so it is named by the label. */
  groupProps: { "aria-labelledby": string; "aria-describedby"?: string; "aria-invalid"?: boolean };
}

export interface FormFieldProps<TValues extends FieldValues, TName extends FieldPath<TValues>>
  extends Omit<FieldProps, "children" | "error" | "id"> {
  name: TName;
  /**
   * A single Junco control (Input, Textarea, Select, Checkbox, Switch, RadioGroup); it gets wired
   * up automatically. For anything else use `render`.
   */
  children?: React.ReactElement;
  render?: (props: FormFieldRenderProps<TValues, TName>) => React.ReactElement;
  /** "inline" puts the label beside the control (checkboxes and switches). Default: inline for those, stacked otherwise. */
  layout?: "stacked" | "inline";
}

/** A form field bound to react-hook-form: label, control, help text and the validation error. */
export function FormField<TValues extends FieldValues = FieldValues, TName extends FieldPath<TValues> = FieldPath<TValues>>({
  name,
  label,
  description,
  isRequired,
  isDisabled,
  children,
  render,
  layout,
  className,
  classNames,
  ...props
}: FormFieldProps<TValues, TName>) {
  const { control } = useFormContext<TValues>();
  const { field, fieldState } = useController<TValues, TName>({ name, control, disabled: isDisabled });
  const id = `form-${React.useId().replace(/[^\w-]/g, "")}-${String(name).replace(/[^\w-]/g, "-")}`;
  const error = fieldState.error?.message ?? (fieldState.error ? "Invalid value" : undefined);

  const describedBy =
    [description ? `${id}-description` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
  const groupProps = { "aria-labelledby": `${id}-label`, "aria-describedby": describedBy, "aria-invalid": error ? true : undefined };

  let control_: React.ReactNode = null;
  let kind: Kind = "event";
  if (render) {
    control_ = render({ field, fieldState, groupProps });
  } else if (children && React.isValidElement(children)) {
    kind = kindOf(children);
    const childProps = children.props as Record<string, unknown>;
    const bound: Record<string, unknown> =
      kind === "checked"
        ? { checked: Boolean(field.value), onCheckedChange: (v: unknown) => field.onChange(v === true), ref: field.ref }
        : kind === "value"
          ? { value: field.value ?? "", onValueChange: field.onChange }
          : { value: field.value ?? "", onChange: field.onChange, ref: field.ref };
    control_ = React.cloneElement(children, {
      ...bound,
      name: field.name,
      onBlur: (e: unknown) => {
        field.onBlur();
        (childProps.onBlur as ((e: unknown) => void) | undefined)?.(e);
      },
      ...(children.type === RadioGroup ? groupProps : {}),
      ...(children.type === Select ? { name: field.name } : {}),
    } as Record<string, unknown>);
  }

  const inline = (layout ?? (kind === "checked" ? "inline" : "stacked")) === "inline";

  return (
    <Field
      id={id}
      label={inline ? undefined : label}
      description={description}
      error={error}
      isRequired={isRequired}
      isDisabled={isDisabled}
      className={className}
      classNames={classNames}
      data-name={name}
      {...props}
    >
      {inline ? (
        <div className="flex items-center gap-2">
          {control_}
          {label && (
            <Label id={`${id}-label`} htmlFor={id} isRequired={isRequired} className={cn(isDisabled && "opacity-50", classNames?.label)}>
              {label}
            </Label>
          )}
        </div>
      ) : (
        control_
      )}
    </Field>
  );
}

/** A submit button that shows a spinner while the form submits. */
export function FormSubmit({ isLoading, children = "Submit", ...props }: ButtonProps) {
  const { formState } = useFormContext();
  return (
    <Button type="submit" isLoading={isLoading ?? formState.isSubmitting} {...props}>
      {children}
    </Button>
  );
}

/**
 * Shows a form-wide error set with `form.setError("root", { message })`, e.g. a failed request.
 * Announced to screen readers when it appears.
 */
export function FormRootError({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { formState } = useFormContext();
  const message = formState.errors.root?.message;
  if (!message) return null;
  return (
    <div
      role="alert"
      className={cn(
        "rounded-card border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive-text",
        className,
      )}
      {...props}
    >
      {String(message)}
    </div>
  );
}

export { useForm, useFormContext, useWatch, type SubmitHandler, type UseFormReturn } from "react-hook-form";
