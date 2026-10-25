import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Checkbox, cn, Input, toast, type InputProps } from "@junco/react";
import { Form, FormField, FormRootError, FormSubmit, useForm } from "@junco/react/form";
import { z } from "zod";
import { renderSlot, type Slots } from "../../lib/slots";
import { AuthCard, LogoMark, type AuthProvider } from "../blocks";
import { ArrowLeftIcon, EyeIcon, EyeOffIcon, GitHubIcon, GoogleIcon, MailIcon } from "../icons";

/* ------------------------------------------------------------------ shared */

export type AuthVariant = "centered" | "split";

export interface BrandPanelProps {
  appName: string;
  quote?: { text: string; author: string; role?: string };
}

/** The left half of the split layout: logo, a quote, nothing else. */
export function BrandPanel({ appName, quote }: BrandPanelProps) {
  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden border-r border-border bg-muted/50 p-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background-image:radial-gradient(var(--border)_1px,transparent_1px)] [background-size:20px_20px] [mask-image:linear-gradient(to_bottom,black,transparent_75%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-40 size-[36rem] rounded-pill bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--primary)_18%,transparent),transparent)]"
      />
      <div className="relative flex items-center gap-2.5 text-base font-semibold">
        <LogoMark name={appName} className="size-8 text-sm" />
        {appName}
      </div>
      {quote && (
        <figure className="relative grid max-w-md gap-4">
          <blockquote className="text-xl leading-8 font-medium tracking-tight text-balance text-foreground">
            “{quote.text}”
          </blockquote>
          <figcaption className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{quote.author}</span>
            {quote.role && <> · {quote.role}</>}
          </figcaption>
        </figure>
      )}
    </div>
  );
}

const defaultQuote = {
  text: "We moved our whole product onto it in a week. It just looks finished.",
  author: "Maya Chen",
  role: "Head of Design, Northwind",
};

export const defaultAuthProviders: AuthProvider[] = [
  { id: "github", label: "GitHub", icon: <GitHubIcon /> },
  { id: "google", label: "Google", icon: <GoogleIcon /> },
];

interface AuthLayoutProps {
  variant: AuthVariant;
  brand: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

function AuthLayout({ variant, brand, children, className }: AuthLayoutProps) {
  if (variant === "split") {
    return (
      <div className={cn("grid min-h-dvh bg-background lg:grid-cols-2", className)}>
        <div className="max-lg:hidden">{brand}</div>
        <main className="flex items-center justify-center px-4 py-12 sm:px-6">{children}</main>
      </div>
    );
  }
  return (
    <main
      className={cn(
        "relative flex min-h-dvh items-center justify-center overflow-hidden bg-background px-4 py-12 sm:px-6",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-80 [background-image:radial-gradient(var(--border)_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]"
      />
      <div className="relative flex w-full justify-center">{children}</div>
    </main>
  );
}

/** Calls the page's submit handler; shows a thrown error as a form-level message. */
async function run<T>(
  form: { setError: (name: "root", error: { message: string }) => void },
  handler: ((values: T) => void | Promise<void>) | undefined,
  values: T,
  fallback: () => void,
) {
  try {
    if (handler) await handler(values);
    else {
      await new Promise((r) => setTimeout(r, 600));
      fallback();
    }
  } catch (err) {
    form.setError("root", { message: err instanceof Error ? err.message : "Something went wrong. Try again." });
  }
}

/** An Input with a show/hide button. Works inside Field and FormField like any Input. */
export const PasswordInput = React.forwardRef<HTMLInputElement, Omit<InputProps, "type">>(
  ({ className, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false);
    return (
      <div className="relative">
        <Input ref={ref} type={visible ? "text" : "password"} className={cn("pr-10", className)} {...props} />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className={cn(
            "absolute inset-y-0 right-0 grid w-9 place-items-center rounded-r-card text-muted-foreground",
            "transition-colors duration-fast ease-standard hover:text-foreground",
            "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
          )}
        >
          {visible ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
        </button>
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";

const linkClass =
  "font-medium text-foreground underline-offset-4 hover:underline focus-visible:rounded-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

interface AuthPageBase {
  appName?: string;
  variant?: AuthVariant;
  /** Provider buttons. Pass [] to hide them. */
  providers?: AuthProvider[];
  quote?: BrandPanelProps["quote"];
  slots?: Slots<{ brand: BrandPanelProps }>;
  className?: string;
}

/* ------------------------------------------------------------------ Log in */

export const logInSchema = z.object({
  email: z.string().trim().min(1, "Enter your email").email("Enter a valid email, like you@example.com"),
  password: z.string().min(1, "Enter your password"),
  remember: z.boolean(),
});
export type LogInValues = z.infer<typeof logInSchema>;

export interface LogInPageProps extends AuthPageBase {
  /** Throw an Error to show its message on the form. */
  onSubmit?: (values: LogInValues) => void | Promise<void>;
  signUpHref?: string;
  forgotPasswordHref?: string;
  defaultEmail?: string;
}

export function LogInPage({
  appName = "Northwind",
  variant = "centered",
  providers = defaultAuthProviders,
  quote = defaultQuote,
  onSubmit,
  signUpHref = "#/sign-up",
  forgotPasswordHref = "#/forgot-password",
  defaultEmail = "",
  slots,
  className,
}: LogInPageProps) {
  const form = useForm<LogInValues>({
    resolver: zodResolver(logInSchema),
    defaultValues: { email: defaultEmail, password: "", remember: true },
  });
  return (
    <AuthLayout
      variant={variant}
      className={className}
      brand={renderSlot(slots, "brand", BrandPanel, { appName, quote })}
    >
      <AuthCard
        variant={variant === "split" ? "plain" : "card"}
        logo={<LogoMark name={appName} />}
        title={`Log in to ${appName}`}
        description="Welcome back. Enter your details to continue."
        providers={providers.map((p) => ({
          ...p,
          onSelect: p.onSelect ?? (() => toast(`Continuing with ${p.label}…`)),
        }))}
        footer={
          <>
            No account?{" "}
            <a href={signUpHref} className={linkClass}>
              Sign up
            </a>
          </>
        }
      >
        <Form
          form={form}
          onSubmit={(v) => run(form, onSubmit, v, () => toast.success("Logged in", { description: v.email }))}
          className="gap-4"
        >
          <FormRootError />
          <FormField name="email" label="Email">
            <Input type="email" autoComplete="email" placeholder="you@example.com" />
          </FormField>
          <FormField name="password" label="Password">
            <PasswordInput autoComplete="current-password" />
          </FormField>
          <div className="flex items-center justify-between gap-2">
            <FormField name="remember" label="Remember me">
              <Checkbox />
            </FormField>
            <a href={forgotPasswordHref} className={cn(linkClass, "text-sm")}>
              Forgot password?
            </a>
          </div>
          <FormSubmit className="w-full">Log in</FormSubmit>
        </Form>
      </AuthCard>
    </AuthLayout>
  );
}

/* ------------------------------------------------------------------ Sign up */

export const signUpSchema = z.object({
  name: z.string().trim().min(1, "Enter your name"),
  email: z.string().trim().min(1, "Enter your email").email("Enter a valid email, like you@example.com"),
  password: z
    .string()
    .min(8, "Use at least 8 characters")
    .regex(/[0-9]|[^A-Za-z0-9]/, "Add a number or a symbol"),
  terms: z.boolean().refine((v) => v, "Accept the terms to continue"),
});
export type SignUpValues = z.infer<typeof signUpSchema>;

export interface SignUpPageProps extends AuthPageBase {
  onSubmit?: (values: SignUpValues) => void | Promise<void>;
  logInHref?: string;
  termsHref?: string;
  privacyHref?: string;
}

function passwordStrength(pw: string): { score: 0 | 1 | 2 | 3; label: string } {
  if (!pw) return { score: 0, label: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[0-9]/.test(pw) && /[A-Za-z]/.test(pw)) score++;
  if (pw.length >= 12 || /[^A-Za-z0-9]/.test(pw)) score++;
  const s = Math.min(score, 3) as 0 | 1 | 2 | 3;
  return { score: s, label: ["Too short", "Weak", "Good", "Strong"][s]! };
}

function StrengthMeter({ password }: { password: string }) {
  const { score, label } = passwordStrength(password);
  if (!password) return null;
  return (
    <div className="flex items-center gap-2" aria-live="polite">
      <div aria-hidden className="grid flex-1 grid-cols-3 gap-1">
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              "h-1 rounded-pill bg-muted transition-colors duration-base ease-standard",
              i <= score && (score === 1 ? "bg-destructive" : score === 2 ? "bg-warning" : "bg-success"),
            )}
          />
        ))}
      </div>
      <span className="w-16 text-right text-xs text-muted-foreground">
        <span className="sr-only">Password strength: </span>
        {label}
      </span>
    </div>
  );
}

export function SignUpPage({
  appName = "Northwind",
  variant = "centered",
  providers = defaultAuthProviders,
  quote = defaultQuote,
  onSubmit,
  logInHref = "#/log-in",
  termsHref = "#/terms",
  privacyHref = "#/privacy",
  slots,
  className,
}: SignUpPageProps) {
  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "", terms: false },
  });
  const password = form.watch("password");
  return (
    <AuthLayout
      variant={variant}
      className={className}
      brand={renderSlot(slots, "brand", BrandPanel, { appName, quote })}
    >
      <AuthCard
        variant={variant === "split" ? "plain" : "card"}
        logo={<LogoMark name={appName} />}
        title="Create your account"
        description="Free for 14 days. No card needed."
        providers={providers.map((p) => ({
          ...p,
          onSelect: p.onSelect ?? (() => toast(`Continuing with ${p.label}…`)),
        }))}
        footer={
          <>
            Already have an account?{" "}
            <a href={logInHref} className={linkClass}>
              Log in
            </a>
          </>
        }
      >
        <Form
          form={form}
          onSubmit={(v) =>
            run(form, onSubmit, v, () =>
              toast.success("Account created", { description: `Welcome, ${v.name.split(" ")[0]}.` }),
            )
          }
          className="gap-4"
        >
          <FormRootError />
          <FormField name="name" label="Full name">
            <Input autoComplete="name" placeholder="Ada Lovelace" />
          </FormField>
          <FormField name="email" label="Work email">
            <Input type="email" autoComplete="email" placeholder="you@company.com" />
          </FormField>
          <div className="grid gap-2">
            <FormField name="password" label="Password" description="8+ characters, with a number or symbol.">
              <PasswordInput autoComplete="new-password" />
            </FormField>
            <StrengthMeter password={password} />
          </div>
          <FormField
            name="terms"
            label={
              <span className="font-normal text-muted-foreground">
                I agree to the{" "}
                <a href={termsHref} className={linkClass}>
                  Terms
                </a>{" "}
                and{" "}
                <a href={privacyHref} className={linkClass}>
                  Privacy Policy
                </a>
              </span>
            }
          >
            <Checkbox />
          </FormField>
          <FormSubmit className="w-full">Create account</FormSubmit>
        </Form>
      </AuthCard>
    </AuthLayout>
  );
}

/* ------------------------------------------------------------------ Forgot password */

export const forgotPasswordSchema = z.object({
  email: z.string().trim().min(1, "Enter your email").email("Enter a valid email, like you@example.com"),
});
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export interface ForgotPasswordPageProps extends AuthPageBase {
  onSubmit?: (values: ForgotPasswordValues) => void | Promise<void>;
  logInHref?: string;
}

export function ForgotPasswordPage({
  appName = "Northwind",
  variant = "centered",
  quote = defaultQuote,
  onSubmit,
  logInHref = "#/log-in",
  slots,
  className,
}: ForgotPasswordPageProps) {
  const [sentTo, setSentTo] = React.useState<string | null>(null);
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });
  const submit = async (v: ForgotPasswordValues) => {
    let ok = true;
    try {
      if (onSubmit) await onSubmit(v);
      else await new Promise((r) => setTimeout(r, 600));
    } catch (err) {
      ok = false;
      form.setError("root", { message: err instanceof Error ? err.message : "Something went wrong. Try again." });
    }
    if (ok) setSentTo(v.email);
  };
  const back = (
    <a href={logInHref} className={cn(linkClass, "inline-flex items-center gap-1.5")}>
      <ArrowLeftIcon className="size-4" />
      Back to log in
    </a>
  );

  return (
    <AuthLayout
      variant={variant}
      className={className}
      brand={renderSlot(slots, "brand", BrandPanel, { appName, quote })}
    >
      {sentTo ? (
        <AuthCard
          variant={variant === "split" ? "plain" : "card"}
          logo={
            <span className="grid size-11 place-items-center rounded-card border border-border bg-surface text-muted-foreground">
              <MailIcon className="size-5" />
            </span>
          }
          title="Check your email"
          description={
            <>
              We sent a reset link to <span className="font-medium text-foreground">{sentTo}</span>. It expires in 30
              minutes.
            </>
          }
          footer={back}
        >
          <div role="status" className="sr-only">
            Reset link sent to {sentTo}
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => toast.success("Sent another link", { description: sentTo })}
          >
            Resend link
          </Button>
          <button
            type="button"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            onClick={() => setSentTo(null)}
          >
            Use a different email
          </button>
        </AuthCard>
      ) : (
        <AuthCard
          variant={variant === "split" ? "plain" : "card"}
          logo={<LogoMark name={appName} />}
          title="Reset your password"
          description="Enter the email you signed up with and we'll send you a link."
          footer={back}
        >
          <Form form={form} onSubmit={submit} className="gap-4">
            <FormRootError />
            <FormField name="email" label="Email">
              <Input type="email" autoComplete="email" placeholder="you@example.com" />
            </FormField>
            <FormSubmit className="w-full">Send reset link</FormSubmit>
          </Form>
        </AuthCard>
      )}
    </AuthLayout>
  );
}
