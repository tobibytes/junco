import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Badge,
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@junco/react";
import { Form, FormField, FormRootError, FormSubmit, useForm } from "@junco/react/form";
import { z } from "zod";
import { userRoles, type UserRole, type UserStatus } from "./users-data";

/* ------------------------------------------------------------------ badges */

const statusText: Record<UserStatus, string> = { active: "Active", invited: "Invited", suspended: "Suspended" };
const statusColor = { active: "success", invited: "warning", suspended: "danger" } as const;

/** Status as a dot plus a word, never color alone. */
export function UserStatusBadge({ status }: { status: UserStatus }) {
  return (
    <Badge variant="outline" color={statusColor[status]} hasDot>
      {statusText[status]}
    </Badge>
  );
}

export function RoleBadge({ role }: { role: UserRole }) {
  return (
    <Badge variant={role === "Owner" ? "solid" : "outline"} color={role === "Owner" ? "primary" : "neutral"}>
      {role}
    </Badge>
  );
}

/* ------------------------------------------------------------------ invite dialog */

const emailList = z
  .string()
  .trim()
  .min(1, "Enter at least one email")
  .refine(
    (v) =>
      v
        .split(/[\s,;]+/)
        .filter(Boolean)
        .every((e) => z.string().email().safeParse(e).success),
    "One of these isn't a valid email. Separate addresses with commas.",
  );

export const inviteSchema = z.object({
  emails: emailList,
  role: z.enum(userRoles.filter((r) => r !== "Owner") as ["Admin", "Editor", "Member", "Viewer"]),
});
export type InviteValues = { emails: string[]; role: Exclude<UserRole, "Owner"> };

export interface InviteDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** The button that opens it. Omit when controlling `open` yourself. */
  trigger?: React.ReactElement;
  /** Throw an Error to show its message in the dialog. */
  onInvite: (values: InviteValues) => void | Promise<void>;
  defaultRole?: InviteValues["role"];
}

/** Invite people by email with a role. Accepts several addresses at once. */
export function InviteDialog({
  open: openProp,
  onOpenChange,
  trigger,
  onInvite,
  defaultRole = "Member",
}: InviteDialogProps) {
  const [innerOpen, setInnerOpen] = React.useState(false);
  const open = openProp ?? innerOpen;
  const setOpen = (v: boolean) => {
    if (openProp === undefined) setInnerOpen(v);
    onOpenChange?.(v);
  };
  const form = useForm<z.infer<typeof inviteSchema>>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { emails: "", role: defaultRole },
  });

  React.useEffect(() => {
    if (!open) form.reset({ emails: "", role: defaultRole });
  }, [open, form, defaultRole]);

  const submit = async (v: z.infer<typeof inviteSchema>) => {
    const emails = [
      ...new Set(
        v.emails
          .split(/[\s,;]+/)
          .filter(Boolean)
          .map((e) => e.toLowerCase()),
      ),
    ];
    try {
      await onInvite({ emails, role: v.role });
      setOpen(false);
    } catch (err) {
      form.setError("root", { message: err instanceof Error ? err.message : "Couldn't send the invites. Try again." });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && React.cloneElement(trigger, { onClick: () => setOpen(true) } as Record<string, unknown>)}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite people</DialogTitle>
          <DialogDescription>They'll get an email with a link to join. Invites expire after 7 days.</DialogDescription>
        </DialogHeader>
        <Form form={form} onSubmit={submit} className="gap-4">
          <FormRootError />
          <FormField name="emails" label="Emails" description="Separate several with commas.">
            <Input placeholder="grace@company.com, alan@company.com" autoComplete="off" />
          </FormField>
          <FormField name="role" label="Role">
            <Select>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Admin: manage people and billing</SelectItem>
                <SelectItem value="Editor">Editor: create and edit everything</SelectItem>
                <SelectItem value="Member">Member: edit their own work</SelectItem>
                <SelectItem value="Viewer">Viewer: read only</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <FormSubmit>Send invites</FormSubmit>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ confirm dialog */

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  confirmLabel?: string;
  /** Red confirm button for destructive actions. */
  isDanger?: boolean;
  onConfirm: () => void | Promise<void>;
}

/** "Are you sure?" with a clear consequence and a named action, not "OK". */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  isDanger,
  onConfirm,
}: ConfirmDialogProps) {
  const [busy, setBusy] = React.useState(false);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm" role="alertdialog">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            variant={isDanger ? "danger" : "solid"}
            isLoading={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await onConfirm();
                onOpenChange(false);
              } finally {
                setBusy(false);
              }
            }}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
