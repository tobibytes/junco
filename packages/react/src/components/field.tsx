import * as React from "react";
import { cn } from "../lib/cn";
import { Label } from "./label";

interface FieldContextValue {
  id: string;
  descriptionId?: string;
  errorId?: string;
  isInvalid: boolean;
  isDisabled: boolean;
  isRequired: boolean;
}

const FieldContext = React.createContext<FieldContextValue | null>(null);

interface ControlProps {
  id?: string;
  disabled?: boolean;
  required?: boolean;
  "aria-describedby"?: string;
  "aria-invalid"?: React.AriaAttributes["aria-invalid"];
}

/**
 * Lets a control pick up its id, description, error and state from a surrounding <Field>.
 * Props passed directly to the control win.
 */
export function useFieldControl<P extends ControlProps>(props: P): P {
  const field = React.useContext(FieldContext);
  if (!field) return props;
  const describedBy = [props["aria-describedby"], field.descriptionId, field.errorId].filter(Boolean).join(" ");
  return {
    ...props,
    id: props.id ?? field.id,
    disabled: props.disabled ?? (field.isDisabled || undefined),
    required: props.required ?? (field.isRequired || undefined),
    "aria-describedby": describedBy || undefined,
    "aria-invalid": props["aria-invalid"] ?? (field.isInvalid || undefined),
  };
}

export interface FieldProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  label?: React.ReactNode;
  /** Help text under the control. */
  description?: React.ReactNode;
  /** Error message. Setting it marks the control invalid. */
  error?: React.ReactNode;
  isRequired?: boolean;
  isDisabled?: boolean;
  /** Id for the control. Generated when omitted. */
  id?: string;
  classNames?: { root?: string; label?: string; description?: string; error?: string };
  children: React.ReactNode;
}

/**
 * Label + control + help text + error, wired together:
 *
 *   <Field label="Email" description="Work email" error={errors.email}><Input /></Field>
 */
export const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  (
    { className, classNames, label, description, error, isRequired = false, isDisabled = false, id, children, ...props },
    ref,
  ) => {
    const autoId = React.useId();
    const controlId = id ?? `field-${autoId}`;
    const hasError = error !== undefined && error !== null && error !== false && error !== "";
    const ctx: FieldContextValue = {
      id: controlId,
      descriptionId: description ? `${controlId}-description` : undefined,
      errorId: hasError ? `${controlId}-error` : undefined,
      isInvalid: hasError,
      isDisabled,
      isRequired,
    };

    return (
      <FieldContext.Provider value={ctx}>
        <div
          ref={ref}
          data-invalid={hasError || undefined}
          data-disabled={isDisabled || undefined}
          className={cn("grid content-start gap-1.5", classNames?.root, className)}
          {...props}
        >
          {label && (
            <Label id={`${controlId}-label`} htmlFor={controlId} isRequired={isRequired} className={cn(isDisabled && "opacity-50", classNames?.label)}>
              {label}
            </Label>
          )}
          {children}
          {description && (
            <p id={ctx.descriptionId} className={cn("text-xs text-muted-foreground", classNames?.description)}>
              {description}
            </p>
          )}
          {hasError && (
            <p id={ctx.errorId} aria-live="polite" className={cn("text-xs text-destructive-text", classNames?.error)}>
              {error}
            </p>
          )}
        </div>
      </FieldContext.Provider>
    );
  },
);
Field.displayName = "Field";
