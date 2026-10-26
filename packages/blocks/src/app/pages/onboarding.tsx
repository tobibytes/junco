import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, cn, Input, Label, Radio, RadioGroup, Textarea, toast } from "@junco/react";
import { Form, FormField, FormRootError, useForm } from "@junco/react/form";
import { z } from "zod";
import { renderSlot, type Slots } from "../../lib/slots";
import { EmptyState } from "@junco/react";
import { LogoMark, PageContainer } from "../blocks";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChartIcon,
  CheckIcon,
  FileTextIcon,
  FolderIcon,
  LayersIcon,
  PlusIcon,
  SparklesIcon,
  UploadIcon,
  UsersIcon,
  ZapIcon,
  type IconComponent,
} from "../icons";

/* ------------------------------------------------------------------ Onboarding */

export const onboardingSchema = z.object({
  workspace: z.string().trim().min(2, "At least 2 characters").max(40, "Keep it under 40 characters"),
  slug: z
    .string()
    .trim()
    .min(2, "At least 2 characters")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and dashes only"),
  useCase: z.enum(["product", "engineering", "marketing", "personal"], { message: "Pick one to continue" }),
  invites: z.string().refine(
    (v) =>
      v
        .split(/[\s,;]+/)
        .filter(Boolean)
        .every((e) => z.string().email().safeParse(e).success),
    "One of these isn't a valid email. Separate addresses with commas.",
  ),
});
export type OnboardingValues = z.infer<typeof onboardingSchema>;

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  fields: Array<keyof OnboardingValues>;
}

export const defaultOnboardingSteps: OnboardingStep[] = [
  {
    id: "workspace",
    title: "Name your workspace",
    description: "This is where your team works. You can change it later.",
    fields: ["workspace", "slug"],
  },
  {
    id: "use",
    title: "What will you use it for?",
    description: "We'll set up templates that fit.",
    fields: ["useCase"],
  },
  {
    id: "team",
    title: "Invite your team",
    description: "Work is better together. You can skip this for now.",
    fields: ["invites"],
  },
];

const useCases: Array<{ value: OnboardingValues["useCase"]; label: string; description: string; icon: IconComponent }> =
  [
    { value: "product", label: "Product", description: "Roadmaps, specs, launches", icon: LayersIcon },
    { value: "engineering", label: "Engineering", description: "Sprints, bugs, releases", icon: ZapIcon },
    { value: "marketing", label: "Marketing", description: "Campaigns and content", icon: ChartIcon },
    { value: "personal", label: "Just me", description: "Notes and personal projects", icon: SparklesIcon },
  ];

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 32);

export type OnboardingSlots = {
  aside: { steps: OnboardingStep[]; current: number; appName: string };
};

export interface OnboardingPageProps {
  appName?: string;
  steps?: OnboardingStep[];
  defaultValues?: Partial<OnboardingValues>;
  /** Called with everything at the end. Throw to show an error. */
  onComplete?: (values: OnboardingValues) => void | Promise<void>;
  /** Where "Go to your workspace" goes once every step is done. */
  doneHref?: string;
  /** "centered": one card with a progress bar. "split": a step list on the left (desktop). */
  variant?: "centered" | "split";
  slots?: Slots<OnboardingSlots>;
  className?: string;
}

function StepList({ steps, current, appName }: OnboardingSlots["aside"]) {
  return (
    <div className="grid content-start gap-8">
      <div className="flex items-center gap-2.5 font-semibold">
        <LogoMark name={appName} className="size-8 text-sm" />
        {appName}
      </div>
      <ol className="grid gap-1">
        {steps.map((s, i) => {
          const state = i < current ? "done" : i === current ? "current" : "todo";
          return (
            <li
              key={s.id}
              aria-current={state === "current" ? "step" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-control px-2 py-2 text-sm",
                state === "current" && "bg-accent",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-pill border text-xs font-medium tabular-nums",
                  state === "done" && "border-primary bg-primary text-primary-foreground",
                  state === "current" && "border-foreground text-foreground",
                  state === "todo" && "border-border-strong text-muted-foreground",
                )}
              >
                {state === "done" ? <CheckIcon className="size-3.5" strokeWidth={3} /> : i + 1}
              </span>
              <span className={cn("font-medium", state === "todo" ? "text-muted-foreground" : "text-foreground")}>
                {s.title}
              </span>
              <span className="sr-only">
                {state === "done" ? "(done)" : state === "current" ? "(current step)" : ""}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function OnboardingPage({
  appName = "Northwind",
  steps = defaultOnboardingSteps,
  defaultValues,
  onComplete,
  doneHref = "#/dashboard",
  variant = "centered",
  slots,
  className,
}: OnboardingPageProps) {
  const [current, setCurrent] = React.useState(0);
  const [done, setDone] = React.useState(false);
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { workspace: "", slug: "", invites: "", ...defaultValues } as OnboardingValues,
    mode: "onTouched",
  });
  const slugTouched = React.useRef(Boolean(defaultValues?.slug));
  const workspace = form.watch("workspace");
  React.useEffect(() => {
    if (!slugTouched.current)
      form.setValue("slug", slugify(workspace ?? ""), { shouldValidate: form.formState.isSubmitted });
  }, [workspace, form]);

  const step = steps[current]!;
  const isLast = current === steps.length - 1;

  const go = (i: number) => {
    setCurrent(i);
    // Move focus to the new step's heading so keyboard and screen reader users land in the right place.
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const [busy, setBusy] = React.useState(false);
  const next = async () => {
    if (busy) return;
    const ok = await form.trigger(step.fields, { shouldFocus: true });
    if (!ok) return;
    if (!isLast) return go(current + 1);
    const values = form.getValues();
    setBusy(true);
    try {
      if (onComplete) await onComplete(values);
      else await new Promise((r) => setTimeout(r, 600));
      setDone(true);
      toast.success(`${values.workspace} is ready`);
    } catch (err) {
      form.setError("root", { message: err instanceof Error ? err.message : "Something went wrong. Try again." });
    } finally {
      setBusy(false);
    }
  };

  const body = done ? (
    <div className="grid justify-items-center gap-4 py-6 text-center" role="status">
      <span className="grid size-12 place-items-center rounded-pill bg-success text-success-foreground">
        <CheckIcon className="size-6" strokeWidth={3} />
      </span>
      <h1 className="text-xl font-semibold tracking-tight">You're all set</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        {form.getValues("workspace")} is ready. We added a few starter templates to help you get going.
      </p>
      <Button asChild>
        <a href={doneHref}>
          Go to your workspace
          <ArrowRightIcon className="size-4" />
        </a>
      </Button>
    </div>
  ) : (
    <Form
      form={form}
      // The whole-schema submit would fail on later steps' fields, so validate step by step instead.
      onSubmit={() => {}}
      onSubmitCapture={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void next();
      }}
      className="gap-6"
    >
      <div className="grid gap-1.5">
        <p className="text-xs font-medium text-muted-foreground tabular-nums">
          Step {current + 1} of {steps.length}
        </p>
        <h1 ref={headingRef} tabIndex={-1} className="text-xl font-semibold tracking-tight focus:outline-none">
          {step.title}
        </h1>
        <p className="text-sm text-muted-foreground">{step.description}</p>
      </div>
      <FormRootError />

      {step.id === "workspace" && (
        <div className="grid gap-4">
          <FormField name="workspace" label="Workspace name">
            <Input placeholder="Acme Inc." autoComplete="organization" autoFocus />
          </FormField>
          <FormField
            name="slug"
            label="Workspace URL"
            description={`${appName.toLowerCase()}.app/${form.watch("slug") || "your-team"}`}
          >
            <Input
              onKeyDown={() => {
                slugTouched.current = true;
              }}
              spellCheck={false}
            />
          </FormField>
        </div>
      )}

      {step.id === "use" && (
        <FormField
          name="useCase"
          label="Use case"
          classNames={{ label: "sr-only" }}
          render={({ field, groupProps }) => (
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              className="grid gap-2 sm:grid-cols-2"
              {...groupProps}
            >
              {useCases.map((u) => {
                const Icon = u.icon;
                return (
                  <Label
                    key={u.value}
                    htmlFor={`use-${u.value}`}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-card border border-border bg-surface p-3 font-normal",
                      "transition-colors duration-fast ease-standard hover:bg-accent/60",
                      "has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5",
                    )}
                  >
                    <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <span className="grid flex-1 gap-0.5">
                      <span className="font-medium">{u.label}</span>
                      <span className="text-xs text-muted-foreground">{u.description}</span>
                    </span>
                    <Radio id={`use-${u.value}`} value={u.value} className="mt-0.5" />
                  </Label>
                );
              })}
            </RadioGroup>
          )}
        />
      )}

      {step.id === "team" && (
        <FormField
          name="invites"
          label="Emails"
          description="Separate several with commas. We'll send the invites when you finish."
        >
          <Textarea placeholder="grace@acme.com, alan@acme.com" autoResize />
        </FormField>
      )}

      <div className="flex items-center justify-between gap-2">
        {current > 0 ? (
          <Button type="button" variant="ghost" onClick={() => go(current - 1)}>
            <ArrowLeftIcon className="size-4" />
            Back
          </Button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          {step.id === "team" && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.setValue("invites", "");
                form.clearErrors("invites");
                void next();
              }}
            >
              Skip
            </Button>
          )}
          <Button type="submit" isLoading={busy}>
            {isLast ? "Finish" : "Continue"}
            {!isLast && <ArrowRightIcon className="size-4" />}
          </Button>
        </div>
      </div>
    </Form>
  );

  const progress = (
    <div
      role="progressbar"
      aria-label="Setup progress"
      aria-valuemin={0}
      aria-valuemax={steps.length}
      aria-valuenow={done ? steps.length : current}
      className="h-1 overflow-hidden rounded-pill bg-muted"
    >
      <div
        className="h-full rounded-pill bg-primary transition-[width] duration-slow ease-standard"
        style={{ width: `${((done ? steps.length : current) / steps.length) * 100}%` }}
      />
    </div>
  );

  if (variant === "split") {
    return (
      <div className={cn("grid min-h-dvh bg-background md:grid-cols-[18rem_1fr]", className)}>
        <aside aria-label="Setup steps" className="border-border bg-muted/40 p-6 max-md:border-b md:border-r md:p-8">
          {renderSlot(slots, "aside", StepList, { steps, current: done ? steps.length : current, appName })}
        </aside>
        <main className="flex items-start justify-center px-4 py-10 sm:px-8 md:items-center">
          <div className="w-full max-w-lg">{body}</div>
        </main>
      </div>
    );
  }

  return (
    <main
      className={cn(
        "flex min-h-dvh items-start justify-center bg-background px-4 py-10 sm:items-center sm:px-6",
        className,
      )}
    >
      <div className="grid w-full max-w-lg gap-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 font-semibold">
            <LogoMark name={appName} className="size-8 text-sm" />
            {appName}
          </div>
          <span className="text-xs text-muted-foreground tabular-nums">
            {done ? steps.length : current} of {steps.length} done
          </span>
        </div>
        {progress}
        <div className="rounded-card border border-border bg-card p-6 sm:p-8">{body}</div>
      </div>
    </main>
  );
}

/* ------------------------------------------------------------------ Empty workspace */

export interface EmptyWorkspaceAction {
  title: string;
  description: string;
  icon: IconComponent;
  href?: string;
  onSelect?: () => void;
}

export interface EmptyWorkspacePageProps {
  workspaceName?: string;
  userName?: string;
  actions?: EmptyWorkspaceAction[];
  onCreate?: () => void;
  /** "cards": a grid of starting points. "minimal": one empty state with a single action. */
  variant?: "cards" | "minimal";
  className?: string;
}

const defaultEmptyActions: EmptyWorkspaceAction[] = [
  { title: "Create a project", description: "Start from a blank page.", icon: FolderIcon },
  { title: "Use a template", description: "Roadmaps, sprints, docs and more.", icon: FileTextIcon },
  { title: "Import data", description: "From CSV, Linear, Jira or Notion.", icon: UploadIcon },
  { title: "Invite your team", description: "It's better together.", icon: UsersIcon, href: "#/settings/team" },
];

/** The first thing a new workspace sees: a welcome and a few clear starting points. */
export function EmptyWorkspacePage({
  workspaceName = "Northwind",
  userName = "Ada",
  actions = defaultEmptyActions,
  onCreate,
  variant = "cards",
  className,
}: EmptyWorkspacePageProps) {
  const create = onCreate ?? (() => toast.success("Project created", { description: "Untitled project" }));
  if (variant === "minimal") {
    return (
      <PageContainer size="md" className={cn("min-h-[70dvh] content-center", className)}>
        <h1 className="sr-only">{workspaceName}</h1>
        <EmptyState
          isBordered
          size="lg"
          icon={<FolderIcon />}
          titleAs="h2"
          title={`${workspaceName} has no projects yet`}
          description="Projects hold your team's work. Create one to get started."
          actions={
            <Button onClick={create}>
              <PlusIcon className="size-4" />
              New project
            </Button>
          }
        />
      </PageContainer>
    );
  }
  return (
    <PageContainer size="md" className={className}>
      <div className="grid gap-2 pt-6 sm:pt-12">
        <h1 className="text-2xl font-semibold tracking-tight text-balance">
          Welcome to {workspaceName}, {userName}
        </h1>
        <p className="text-muted-foreground">Your workspace is empty. Here are a few ways to start.</p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {actions.map((a, i) => {
          const Icon = a.icon;
          const inner = (
            <>
              <span className="grid size-9 shrink-0 place-items-center rounded-card border border-border bg-surface text-muted-foreground transition-colors duration-fast group-hover:text-foreground">
                <Icon className="size-4" />
              </span>
              <span className="grid gap-0.5">
                <span className="font-medium">{a.title}</span>
                <span className="text-sm text-muted-foreground">{a.description}</span>
              </span>
              <ArrowRightIcon className="ml-auto size-4 shrink-0 self-center text-muted-foreground opacity-0 transition-opacity duration-fast group-hover:opacity-100 group-focus-visible:opacity-100" />
            </>
          );
          const cls = cn(
            "group flex h-full w-full items-start gap-3 rounded-card border border-border bg-card p-4 text-left",
            "transition-colors duration-fast ease-standard hover:border-foreground/20 hover:bg-accent/40",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          );
          return (
            <li key={a.title}>
              {a.href ? (
                <a href={a.href} className={cls}>
                  {inner}
                </a>
              ) : (
                <button
                  type="button"
                  className={cls}
                  onClick={a.onSelect ?? (i === 0 ? create : () => toast(`${a.title}…`))}
                >
                  {inner}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </PageContainer>
  );
}
