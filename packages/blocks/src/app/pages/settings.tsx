import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  cn,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  EmptyState,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
  toast,
} from "@junco/react";
import { DataTable, type ColumnDef } from "@junco/react/data-table";
import { Form, FormField, FormRootError, FormSubmit, useForm } from "@junco/react/form";
import { z } from "zod";
import { money } from "../../lib/fake";
import { renderSlot, type Slots } from "../../lib/slots";
import {
  NowProvider,
  PageContainer,
  PageHeader,
  SettingsRow,
  SettingsSection,
  TimeAgo,
  useMediaQuery,
  usePageNow,
  type PageHeaderTab,
} from "../blocks";
import { fakeApiKeys, fakeInvoices, fakeUsage, type ApiKey, type Invoice, type UsageMeter } from "../fake-data";
import { CheckIcon, CopyIcon, DownloadIcon, KeyIcon, PlusIcon, UploadIcon } from "../icons";
import { ConfirmDialog, InviteDialog, type InviteValues } from "../user-blocks";
import { useUserColumns } from "./users";
import { fakeUsers, type AppUser, type UserRole } from "../users-data";

/* ------------------------------------------------------------------ layout */

export const defaultSettingsTabs: PageHeaderTab[] = [
  { label: "Profile", href: "#/settings/profile" },
  { label: "Billing", href: "#/settings/billing" },
  { label: "Team", href: "#/settings/team" },
  { label: "API keys", href: "#/settings/api-keys" },
  { label: "Notifications", href: "#/settings/notifications" },
];

export type SettingsLayoutVariant = "tabs" | "sidebar";

interface SettingsShellProps {
  /** Which tab is current (matched by label). */
  current: string;
  tabs?: PageHeaderTab[] | null;
  variant?: SettingsLayoutVariant;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

/** Settings page frame: a "Settings" header with section tabs (top) or a side nav (desktop). */
export function SettingsShell({
  current,
  tabs = defaultSettingsTabs,
  variant = "tabs",
  description,
  actions,
  className,
  children,
}: SettingsShellProps) {
  const marked = tabs?.map((t) => ({ ...t, isActive: t.isActive ?? t.label === current }));
  if (variant === "sidebar" && marked) {
    return (
      <PageContainer className={className}>
        <PageHeader title="Settings" description={description} actions={actions} />
        <div className="grid gap-8 md:grid-cols-[11rem_1fr]">
          <nav
            aria-label="Settings"
            className="max-md:-mx-1 max-md:flex max-md:gap-1 max-md:overflow-x-auto md:grid md:content-start md:gap-0.5"
          >
            {marked.map((t) => (
              <a
                key={t.label}
                href={t.href}
                aria-current={t.isActive ? "page" : undefined}
                className={cn(
                  "flex h-8 shrink-0 items-center rounded-control px-2.5 text-sm font-medium whitespace-nowrap text-muted-foreground",
                  "transition-colors duration-fast ease-standard hover:bg-accent hover:text-foreground",
                  "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
                  "aria-[current=page]:bg-accent aria-[current=page]:text-foreground",
                )}
              >
                {t.label}
              </a>
            ))}
          </nav>
          <div className="grid min-w-0 content-start gap-10">{children}</div>
        </div>
      </PageContainer>
    );
  }
  return (
    <PageContainer size="md" className={className}>
      <PageHeader title="Settings" description={description} actions={actions} tabs={marked} />
      <div className="grid gap-10">{children}</div>
    </PageContainer>
  );
}

interface SettingsPageBase {
  variant?: SettingsLayoutVariant;
  /** Section tabs. Pass null to hide them (e.g. when your app has its own settings nav). */
  tabs?: PageHeaderTab[] | null;
  className?: string;
}

/* ------------------------------------------------------------------ Profile */

export const profileSchema = z.object({
  name: z.string().trim().min(1, "Enter your name").max(80, "Keep it under 80 characters"),
  email: z.string().trim().email("Enter a valid email"),
  username: z
    .string()
    .trim()
    .min(3, "At least 3 characters")
    .max(24, "At most 24 characters")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and dashes only"),
  bio: z.string().max(160, "Keep it under 160 characters"),
  timezone: z.string(),
});
export type ProfileValues = z.infer<typeof profileSchema>;

export type SettingsProfileSlots = {
  danger: { onDelete: () => void };
};

export interface SettingsProfilePageProps extends SettingsPageBase {
  profile?: Partial<ProfileValues> & { avatarUrl?: string };
  onSave?: (values: ProfileValues) => void | Promise<void>;
  onDeleteAccount?: () => void | Promise<void>;
  slots?: Slots<SettingsProfileSlots>;
}

const timezones = [
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Berlin",
  "Africa/Lagos",
  "Asia/Tokyo",
];

function DangerZone({ onDelete }: SettingsProfileSlots["danger"]) {
  return (
    <SettingsSection title="Danger zone" description="Permanent actions. There's no undo.">
      <SettingsRow title="Delete account" description="Deletes your account and removes you from every workspace.">
        <Button variant="danger" onClick={onDelete}>
          Delete account
        </Button>
      </SettingsRow>
    </SettingsSection>
  );
}

export function SettingsProfilePage({
  profile,
  onSave,
  onDeleteAccount,
  variant,
  tabs,
  slots,
  className,
}: SettingsProfilePageProps) {
  const defaults: ProfileValues = {
    name: profile?.name ?? "Ada Lovelace",
    email: profile?.email ?? "ada@northwind.com",
    username: profile?.username ?? "ada",
    bio: profile?.bio ?? "Writing the first programs. Into engines, poetry and maths.",
    timezone: profile?.timezone ?? "Europe/London",
  };
  const form = useForm<ProfileValues>({ resolver: zodResolver(profileSchema), defaultValues: defaults });
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const name = form.watch("name");
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = React.useState(profile?.avatarUrl);

  const save = async (v: ProfileValues) => {
    try {
      if (onSave) await onSave(v);
      else await new Promise((r) => setTimeout(r, 500));
      form.reset(v);
      toast.success("Profile saved");
    } catch (err) {
      form.setError("root", { message: err instanceof Error ? err.message : "Couldn't save. Try again." });
    }
  };

  return (
    <SettingsShell current="Profile" variant={variant} tabs={tabs} className={className}>
      <Form form={form} onSubmit={save} className="gap-10">
        <SettingsSection
          title="Profile"
          description="How you show up to your team."
          footer={
            <>
              <Button
                type="button"
                variant="ghost"
                disabled={!form.formState.isDirty}
                onClick={() => form.reset(defaults)}
              >
                Discard
              </Button>
              <FormSubmit disabled={!form.formState.isDirty}>Save changes</FormSubmit>
            </>
          }
        >
          <SettingsRow title="Photo" description="A square image, at least 256 px.">
            <Avatar name={name || "?"} src={avatar} size="lg" />
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="sr-only"
              tabIndex={-1}
              aria-hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setAvatar(URL.createObjectURL(file));
                  toast.success("Photo updated");
                }
              }}
            />
            <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
              <UploadIcon className="size-4" />
              Upload
            </Button>
          </SettingsRow>
          <div className="grid items-start gap-4 py-4 sm:grid-cols-2">
            <FormRootError className="sm:col-span-2" />
            <FormField name="name" label="Full name">
              <Input autoComplete="name" />
            </FormField>
            <FormField name="username" label="Username" description="Your profile lives at northwind.com/ada.">
              <Input autoComplete="username" />
            </FormField>
            <FormField name="email" label="Email" className="sm:col-span-2">
              <Input type="email" autoComplete="email" />
            </FormField>
            <FormField name="bio" label="Bio" description="Up to 160 characters." className="sm:col-span-2">
              <Textarea autoResize />
            </FormField>
            <FormField name="timezone" label="Time zone" className="sm:col-span-2">
              <Select>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>
        </SettingsSection>
      </Form>
      {renderSlot(slots, "danger", DangerZone, { onDelete: () => setConfirmDelete(true) })}
      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        isDanger
        title="Delete your account?"
        description="This deletes your account and everything only you can see. Shared work stays with the workspace."
        confirmLabel="Delete account"
        onConfirm={async () => {
          await onDeleteAccount?.();
          toast("Account scheduled for deletion", { description: "You have 14 days to change your mind." });
        }}
      />
    </SettingsShell>
  );
}

/* ------------------------------------------------------------------ Billing */

export interface BillingPlan {
  name: string;
  price: number;
  interval: "month" | "year";
  renewsAt: string;
  features?: string[];
}

export type SettingsBillingSlots = {
  plan: { plan: BillingPlan; onChangePlan: () => void; onCancel: () => void };
  usage: { usage: UsageMeter[] };
  invoices: { invoices: Invoice[] };
};

export interface SettingsBillingPageProps extends SettingsPageBase {
  plan?: BillingPlan;
  usage?: UsageMeter[];
  invoices?: Invoice[];
  paymentMethod?: { brand: string; last4: string; expires: string };
  onChangePlan?: () => void;
  onCancelPlan?: () => void | Promise<void>;
  onUpdatePayment?: () => void;
  slots?: Slots<SettingsBillingSlots>;
}

const defaultPlan: BillingPlan = {
  name: "Business",
  price: 28,
  interval: "month",
  renewsAt: "2026-11-25T00:00:00.000Z",
  features: ["Unlimited projects", "SAML SSO", "Audit log", "Priority support"],
};

function PlanCard({ plan, onChangePlan, onCancel }: SettingsBillingSlots["plan"]) {
  return (
    <Card>
      <CardContent className="grid gap-5 pt-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="grid gap-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold tracking-tight">{plan.name}</h2>
              <Badge color="primary">Current plan</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
                {money(plan.price)}
              </span>{" "}
              per seat / {plan.interval}. Renews{" "}
              {new Date(plan.renewsAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
                timeZone: "UTC",
              })}
              .
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" onClick={onCancel}>
              Cancel plan
            </Button>
            <Button onClick={onChangePlan}>Change plan</Button>
          </div>
        </div>
        {plan.features && (
          <ul className="grid gap-2 text-sm sm:grid-cols-2">
            {plan.features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-muted-foreground">
                <CheckIcon className="size-4 shrink-0 text-success-text" />
                {f}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

const fmtUsage = (n: number, unit?: string) =>
  `${n >= 10_000 ? new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n) : n.toLocaleString("en-US")}${unit ? ` ${unit}` : ""}`;

/** A labeled progress bar. Shows the numbers in text so it never relies on the bar alone. */
export function UsageBar({ label, used, limit, unit }: UsageMeter) {
  const pct = Math.min(100, (used / limit) * 100);
  const tone = pct >= 90 ? "bg-destructive" : pct >= 75 ? "bg-warning" : "bg-primary";
  return (
    <div className="grid gap-2">
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground tabular-nums">
          {fmtUsage(used, unit)} of {fmtUsage(limit, unit)}
          {pct >= 90 && <span className="ml-2 font-medium text-destructive-text">Almost full</span>}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={limit}
        aria-valuenow={used}
        aria-valuetext={`${fmtUsage(used, unit)} of ${fmtUsage(limit, unit)}`}
        className="h-2 overflow-hidden rounded-pill bg-muted"
      >
        <div
          className={cn("h-full rounded-pill transition-[width] duration-slow ease-standard", tone)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function UsageCard({ usage }: SettingsBillingSlots["usage"]) {
  return (
    <SettingsSection title="Usage" description="Resets on the 25th of each month.">
      <div className="grid gap-5 py-5">
        {usage.map((u) => (
          <UsageBar key={u.label} {...u} />
        ))}
      </div>
    </SettingsSection>
  );
}

const invoiceStatus = { paid: ["success", "Paid"], open: ["warning", "Due"], failed: ["danger", "Failed"] } as const;

const invoiceColumns: ColumnDef<Invoice>[] = [
  {
    accessorKey: "number",
    header: "Invoice",
    cell: ({ getValue }) => <span className="font-mono text-xs">{getValue<string>()}</span>,
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap">
        {new Date(getValue<string>()).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          timeZone: "UTC",
        })}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const [color, text] = invoiceStatus[row.original.status];
      return (
        <Badge variant="outline" color={color} hasDot>
          {text}
        </Badge>
      );
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    meta: { align: "right" },
    cell: ({ getValue }) => <span className="tabular-nums">{money(getValue<number>())}</span>,
  },
  {
    id: "download",
    header: () => <span className="sr-only">Download</span>,
    enableSorting: false,
    meta: { align: "right" },
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="icon"
        className="size-8"
        aria-label={`Download ${row.original.number}`}
        onClick={() => toast.success(`Downloading ${row.original.number}.pdf`)}
      >
        <DownloadIcon className="size-4" />
      </Button>
    ),
  },
];

function InvoicesCard({ invoices }: SettingsBillingSlots["invoices"]) {
  // On phones the date identifies the invoice; the number column would push the download button off screen.
  const isPhone = useMediaQuery("(max-width: 639px)");
  return (
    // A plain div: the table already exposes a region named by its caption.
    <div className="grid gap-4">
      <div className="grid gap-1">
        <h2 className="text-base font-semibold tracking-tight">Invoices</h2>
        <p className="text-sm text-muted-foreground">Sent to billing@northwind.com.</p>
      </div>
      <DataTable
        columns={invoiceColumns}
        data={invoices}
        getRowId={(i) => i.id}
        caption="Invoices"
        pageSize={false}
        isStickyHeader={false}
        columnVisibility={{ number: !isPhone }}
      />
    </div>
  );
}

export function SettingsBillingPage({
  plan = defaultPlan,
  usage,
  invoices,
  paymentMethod = { brand: "Visa", last4: "4242", expires: "08/28" },
  onChangePlan,
  onCancelPlan,
  onUpdatePayment,
  variant,
  tabs,
  slots,
  className,
}: SettingsBillingPageProps) {
  const [confirmCancel, setConfirmCancel] = React.useState(false);
  return (
    <SettingsShell current="Billing" variant={variant} tabs={tabs} className={className}>
      {renderSlot(slots, "plan", PlanCard, {
        plan,
        onChangePlan: onChangePlan ?? (() => toast("Opening plans…")),
        onCancel: () => setConfirmCancel(true),
      })}
      {renderSlot(slots, "usage", UsageCard, { usage: usage ?? fakeUsage() })}
      <SettingsSection title="Payment method">
        <SettingsRow
          title={
            <span className="flex items-center gap-2">
              <span className="rounded-xs border border-border px-1.5 py-0.5 text-[11px] font-semibold tracking-wide">
                {paymentMethod.brand.toUpperCase()}
              </span>
              •••• {paymentMethod.last4}
            </span>
          }
          description={`Expires ${paymentMethod.expires}`}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={onUpdatePayment ?? (() => toast("Opening secure payment form…"))}
          >
            Update
          </Button>
        </SettingsRow>
      </SettingsSection>
      {renderSlot(slots, "invoices", InvoicesCard, { invoices: invoices ?? fakeInvoices() })}
      <ConfirmDialog
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        isDanger
        title={`Cancel your ${plan.name} plan?`}
        description={`You keep ${plan.name} features until ${new Date(plan.renewsAt).toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "UTC" })}, then move to the Free plan.`}
        confirmLabel="Cancel plan"
        onConfirm={async () => {
          await onCancelPlan?.();
          toast("Plan cancelled", { description: "You can resubscribe anytime." });
        }}
      />
    </SettingsShell>
  );
}

/* ------------------------------------------------------------------ Team */

export interface TeamMembersPageProps extends SettingsPageBase {
  members?: AppUser[];
  onMembersChange?: (members: AppUser[]) => void;
  onInvite?: (values: InviteValues) => void | Promise<void>;
  seats?: { used: number; limit: number };
}

export function TeamMembersPage({
  members,
  onMembersChange,
  onInvite,
  seats,
  variant,
  tabs,
  className,
}: TeamMembersPageProps) {
  const [inner, setInner] = React.useState<AppUser[]>(() => members ?? fakeUsers(8, 9));
  const list = members ?? inner;
  const listRef = React.useRef(list);
  listRef.current = list;
  const setList = (next: AppUser[]) => {
    if (members === undefined) setInner(next);
    onMembersChange?.(next);
  };
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const seatInfo = seats ?? { used: list.length, limit: 10 };

  const onRoleChange = React.useCallback((u: AppUser, role: UserRole) => {
    setList(listRef.current.map((m) => (m.id === u.id ? { ...m, role } : m)));
    toast.success(`${u.name} is now ${role === "Admin" ? "an" : "a"} ${role}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const onRemove = React.useCallback((u: AppUser) => {
    const before = listRef.current;
    setList(before.filter((m) => m.id !== u.id));
    toast(`${u.name} removed`, { action: { label: "Undo", onClick: () => setList(before) } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const onResend = React.useCallback((u: AppUser) => toast.success("Invite sent again", { description: u.email }), []);
  const columns = useUserColumns({ onRoleChange, onRemove, onResend });

  const invite = async (v: InviteValues) => {
    if (seatInfo.used + v.emails.length > seatInfo.limit) {
      throw new Error(
        `That's ${seatInfo.used + v.emails.length} seats, and your plan has ${seatInfo.limit}. Add seats in Billing first.`,
      );
    }
    if (onInvite) await onInvite(v);
    setList([
      ...v.emails.map((email, i) => ({
        id: `team_inv_${Date.now()}_${i}`,
        name: email
          .split("@")[0]!
          .replace(/[._-]+/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase()),
        email,
        role: v.role,
        status: "invited" as const,
      })),
      ...listRef.current,
    ]);
    toast.success(v.emails.length === 1 ? "Invite sent" : `${v.emails.length} invites sent`);
  };

  return (
    <SettingsShell
      current="Team"
      variant={variant}
      tabs={tabs}
      className={className}
      actions={
        <Button onClick={() => setInviteOpen(true)} aria-haspopup="dialog">
          <PlusIcon className="size-4" />
          Invite
        </Button>
      }
    >
      <section aria-labelledby="members-title" className="grid gap-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div className="grid gap-1">
            <h2 id="members-title" className="text-base font-semibold tracking-tight">
              Members
            </h2>
            <p className="text-sm text-muted-foreground">
              {seatInfo.used} of {seatInfo.limit} seats used.
            </p>
          </div>
        </div>
        <DataTable
          columns={columns.filter(
            (c) => c.id !== "lastActiveAt" && (c as { accessorKey?: string }).accessorKey !== "lastActiveAt",
          )}
          data={list}
          getRowId={(u) => u.id}
          caption="Team members"
          pageSize={false}
          isStickyHeader={false}
        />
      </section>
      <InviteDialog open={inviteOpen} onOpenChange={setInviteOpen} onInvite={invite} />
    </SettingsShell>
  );
}

/* ------------------------------------------------------------------ API keys */

export const createKeySchema = z.object({
  name: z.string().trim().min(1, "Name the key so you know where it's used").max(40, "Keep it under 40 characters"),
  scope: z.enum(["read", "write", "admin"]),
});
type CreateKeyValues = z.infer<typeof createKeySchema>;

export interface ApiKeysPageProps extends SettingsPageBase {
  keys?: ApiKey[];
  onKeysChange?: (keys: ApiKey[]) => void;
  /** Create the key on your server and return its full secret. Fake one when omitted. */
  onCreate?: (values: CreateKeyValues) => Promise<{ key: ApiKey; secret: string }>;
  onRevoke?: (key: ApiKey) => void | Promise<void>;
  /** Clock for relative times. Defaults to real time with real keys, the fake clock otherwise. */
  now?: number;
}

function randomSecret() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = new Uint8Array(32);
  globalThis.crypto?.getRandomValues?.(bytes);
  return "jk_live_" + Array.from(bytes, (b, i) => chars[(b || i * 7) % chars.length]).join("");
}

function CopyField({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = React.useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy", { description: "Select the key and copy it by hand." });
    }
  };
  return (
    <div className="flex gap-2">
      <Input
        readOnly
        value={value}
        aria-label={label}
        className="font-mono text-xs"
        onFocus={(e) => e.currentTarget.select()}
      />
      <Button type="button" variant="outline" onClick={copy} aria-label={copied ? "Copied" : `Copy ${label}`}>
        {copied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
        <span className="max-sm:sr-only">{copied ? "Copied" : "Copy"}</span>
      </Button>
    </div>
  );
}

const scopeLabel = { read: "Read only", write: "Read and write", admin: "Full access" } as const;

export function ApiKeysPage({
  keys,
  onKeysChange,
  onCreate,
  onRevoke,
  now: nowProp,
  variant,
  tabs,
  className,
}: ApiKeysPageProps) {
  const now = usePageNow(nowProp, keys !== undefined);
  const [inner, setInner] = React.useState<ApiKey[]>(() => keys ?? fakeApiKeys());
  const list = keys ?? inner;
  const setList = (next: ApiKey[]) => {
    if (keys === undefined) setInner(next);
    onKeysChange?.(next);
  };
  const [open, setOpen] = React.useState(false);
  const [secret, setSecret] = React.useState<string | null>(null);
  const [revoking, setRevoking] = React.useState<ApiKey | null>(null);
  const form = useForm<CreateKeyValues>({
    resolver: zodResolver(createKeySchema),
    defaultValues: { name: "", scope: "write" },
  });

  const create = async (v: CreateKeyValues) => {
    try {
      const result = onCreate
        ? await onCreate(v)
        : await new Promise<{ key: ApiKey; secret: string }>((resolve) => {
            const s = randomSecret();
            setTimeout(
              () =>
                resolve({
                  secret: s,
                  key: {
                    id: `key_${Date.now()}`,
                    name: v.name,
                    scope: v.scope,
                    preview: `jk_live_…${s.slice(-4)}`,
                    createdAt: new Date(now).toISOString(),
                  },
                }),
              400,
            );
          });
      setList([result.key, ...list]);
      setSecret(result.secret);
    } catch (err) {
      form.setError("root", { message: err instanceof Error ? err.message : "Couldn't create the key. Try again." });
    }
  };

  const close = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setSecret(null);
      form.reset({ name: "", scope: "write" });
    }
  };

  return (
    <NowProvider value={now}>
      <SettingsShell
        current="API keys"
        variant={variant}
        tabs={tabs}
        className={className}
        actions={
          <Button onClick={() => setOpen(true)} aria-haspopup="dialog">
            <PlusIcon className="size-4" />
            Create key
          </Button>
        }
      >
        <section aria-labelledby="keys-title" className="grid gap-4">
          <div className="grid gap-1">
            <h2 id="keys-title" className="text-base font-semibold tracking-tight">
              API keys
            </h2>
            <p className="text-sm text-muted-foreground">
              Keys act as you. Keep them secret and rotate them if they leak.
            </p>
          </div>
          {list.length === 0 ? (
            <EmptyState
              isBordered
              icon={<KeyIcon />}
              title="No API keys"
              description="Create a key to call the API from your servers or CI."
              actions={<Button onClick={() => setOpen(true)}>Create key</Button>}
            />
          ) : (
            <Card>
              <ul className="divide-y divide-border">
                {list.map((k) => (
                  <li key={k.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-5">
                    <div className="grid min-w-0 flex-1 gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium">{k.name}</span>
                        <Badge variant="outline">{scopeLabel[k.scope]}</Badge>
                      </div>
                      <span className="flex flex-wrap gap-x-1.5 text-xs text-muted-foreground">
                        <code className="font-mono">{k.preview}</code>
                        <span aria-hidden>·</span>
                        <span>
                          Created <TimeAgo iso={k.createdAt} />
                        </span>
                        <span aria-hidden>·</span>
                        <span>
                          {k.lastUsedAt ? (
                            <>
                              Used <TimeAgo iso={k.lastUsedAt} />
                            </>
                          ) : (
                            "Never used"
                          )}
                        </span>
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setRevoking(k)} aria-label={`Revoke ${k.name}`}>
                      Revoke
                    </Button>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </section>

        <Dialog open={open} onOpenChange={close}>
          <DialogContent>
            {secret ? (
              <>
                <DialogHeader>
                  <DialogTitle>Save your key</DialogTitle>
                  <DialogDescription>
                    This is the only time you'll see it. Store it somewhere safe, like your secrets manager.
                  </DialogDescription>
                </DialogHeader>
                <CopyField value={secret} label="API key" />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button>Done</Button>
                  </DialogClose>
                </DialogFooter>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle>Create API key</DialogTitle>
                  <DialogDescription>Give it a name and only the access it needs.</DialogDescription>
                </DialogHeader>
                <Form form={form} onSubmit={create} className="gap-4">
                  <FormRootError />
                  <FormField name="name" label="Name" description="For example, the service that uses it.">
                    <Input placeholder="Production server" autoComplete="off" />
                  </FormField>
                  <FormField name="scope" label="Access">
                    <Select>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="read">Read only</SelectItem>
                        <SelectItem value="write">Read and write</SelectItem>
                        <SelectItem value="admin">Full access</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="outline">
                        Cancel
                      </Button>
                    </DialogClose>
                    <FormSubmit>Create key</FormSubmit>
                  </DialogFooter>
                </Form>
              </>
            )}
          </DialogContent>
        </Dialog>

        <ConfirmDialog
          open={revoking !== null}
          onOpenChange={(o) => !o && setRevoking(null)}
          isDanger
          title={`Revoke "${revoking?.name}"?`}
          description="Anything using this key stops working right away. You can't undo this."
          confirmLabel="Revoke key"
          onConfirm={async () => {
            if (!revoking) return;
            await onRevoke?.(revoking);
            setList(list.filter((k) => k.id !== revoking.id));
            toast.success("Key revoked", { description: revoking.name });
          }}
        />
      </SettingsShell>
    </NowProvider>
  );
}

/* ------------------------------------------------------------------ Notifications */

export interface NotificationTopic {
  id: string;
  label: string;
  description: string;
}

export type NotificationChannel = "email" | "push" | "slack";
export type NotificationPrefs = Record<string, Partial<Record<NotificationChannel, boolean>>>;

export interface NotificationsPageProps extends SettingsPageBase {
  topics?: NotificationTopic[];
  channels?: NotificationChannel[];
  prefs?: NotificationPrefs;
  onSave?: (prefs: NotificationPrefs) => void | Promise<void>;
}

const defaultTopics: NotificationTopic[] = [
  { id: "mentions", label: "Mentions", description: "Someone @mentions you or replies to you." },
  { id: "comments", label: "Comments", description: "New comments on things you own." },
  { id: "invites", label: "Team changes", description: "People join, leave or change role." },
  { id: "billing", label: "Billing", description: "Receipts, failed payments and plan changes." },
  { id: "product", label: "Product news", description: "New features and tips, about once a month." },
];

const defaultPrefs: NotificationPrefs = {
  mentions: { email: true, push: true, slack: true },
  comments: { email: true, push: false, slack: true },
  invites: { email: true, push: false, slack: false },
  billing: { email: true, push: false, slack: false },
  product: { email: false, push: false, slack: false },
};

const channelLabel: Record<NotificationChannel, string> = { email: "Email", push: "Push", slack: "Slack" };

export function NotificationsPage({
  topics = defaultTopics,
  channels = ["email", "push", "slack"],
  prefs,
  onSave,
  variant,
  tabs,
  className,
}: NotificationsPageProps) {
  const initial = prefs ?? defaultPrefs;
  const [value, setValue] = React.useState<NotificationPrefs>(initial);
  const [saving, setSaving] = React.useState(false);
  const dirty = JSON.stringify(value) !== JSON.stringify(initial);
  const [paused, setPaused] = React.useState(false);

  const set = (topic: string, channel: NotificationChannel, on: boolean) =>
    setValue((v) => ({ ...v, [topic]: { ...v[topic], [channel]: on } }));

  const save = async () => {
    setSaving(true);
    try {
      if (onSave) await onSave(value);
      else await new Promise((r) => setTimeout(r, 500));
      toast.success("Notification settings saved");
    } catch (err) {
      toast.error("Couldn't save", { description: err instanceof Error ? err.message : undefined });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsShell current="Notifications" variant={variant} tabs={tabs} className={className}>
      <SettingsSection title="Do not disturb">
        <SettingsRow
          title="Pause all notifications"
          description="Nothing gets sent until you turn this off."
          htmlFor="pause-all"
        >
          <Switch
            id="pause-all"
            checked={paused}
            onCheckedChange={(on) => {
              setPaused(on);
              toast(on ? "Notifications paused" : "Notifications back on");
            }}
          />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection
        title="What to notify you about"
        description="Pick a channel for each topic."
        footer={
          <>
            <Button variant="ghost" disabled={!dirty} onClick={() => setValue(initial)}>
              Discard
            </Button>
            <Button onClick={save} isLoading={saving} disabled={!dirty}>
              Save changes
            </Button>
          </>
        }
      >
        <div
          className={cn("transition-opacity duration-base", paused && "opacity-50")}
          aria-disabled={paused || undefined}
        >
          <div
            aria-hidden
            className="hidden grid-cols-[1fr_repeat(3,4.5rem)] items-center gap-2 pt-4 pb-2 text-xs font-medium text-muted-foreground sm:grid"
          >
            <span>Topic</span>
            {channels.map((c) => (
              <span key={c} className="text-center">
                {channelLabel[c]}
              </span>
            ))}
          </div>
          <ul className="divide-y divide-border">
            {topics.map((t) => (
              <li key={t.id}>
                <div
                  role="group"
                  aria-labelledby={`topic-${t.id}`}
                  className="grid gap-3 py-4 sm:grid-cols-[1fr_repeat(3,4.5rem)] sm:items-center sm:gap-2"
                >
                  <div className="grid gap-0.5">
                    <span id={`topic-${t.id}`} className="text-sm font-medium">
                      {t.label}
                    </span>
                    <span className="text-sm text-muted-foreground">{t.description}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 sm:contents">
                    {channels.map((c) => {
                      const id = `notify-${t.id}-${c}`;
                      return (
                        <div key={c} className="flex items-center gap-2 sm:justify-center">
                          <Switch
                            id={id}
                            size="sm"
                            disabled={paused}
                            checked={Boolean(value[t.id]?.[c])}
                            onCheckedChange={(on) => set(t.id, c, on)}
                            aria-label={`${t.label} by ${channelLabel[c]}`}
                          />
                          <label htmlFor={id} className="text-sm text-muted-foreground sm:sr-only">
                            {channelLabel[c]}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </SettingsSection>
    </SettingsShell>
  );
}
