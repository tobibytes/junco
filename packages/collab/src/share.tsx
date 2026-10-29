import {
  Avatar,
  Button,
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  toast,
} from "@junco/react";
import * as React from "react";
import { sampleSelf, sampleUsers } from "./fake";
import type { CollabUser } from "./types";

export type ShareRole = "owner" | "editor" | "commenter" | "viewer";
export type LinkAccess = "restricted" | "anyone";

export interface ShareMember {
  user: CollabUser & { email?: string };
  role: ShareRole;
  /** Invited but hasn't joined yet. */
  pending?: boolean;
}

const ROLE_LABEL: Record<ShareRole, string> = { owner: "Owner", editor: "Can edit", commenter: "Can comment", viewer: "Can view" };
const ASSIGNABLE: ShareRole[] = ["editor", "commenter", "viewer"];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sampleMembers: ShareMember[] = [
  { user: { ...sampleSelf, email: "you@northwind.dev" }, role: "owner" },
  { user: { ...sampleUsers[0]!, email: "ada@northwind.dev" }, role: "editor" },
  { user: { ...sampleUsers[1]!, email: "bo@northwind.dev" }, role: "commenter" },
  { user: { id: "u-pending", name: "sam@contractor.io", email: "sam@contractor.io" }, role: "viewer", pending: true },
];

export interface ShareDialogProps {
  /** The element that opens it. Default: a "Share" button. */
  trigger?: React.ReactNode;
  title?: string;
  /** The link to copy. Default: the current page. */
  link?: string;
  /** Default: sample people. */
  members?: ShareMember[];
  /** Your id: you can't change your own role or remove yourself. */
  selfId?: string;
  linkAccess?: LinkAccess;
  /** The role anyone with the link gets. */
  linkRole?: Exclude<ShareRole, "owner">;
  onInvite?: (email: string, role: Exclude<ShareRole, "owner">) => unknown;
  onRoleChange?: (userId: string, role: Exclude<ShareRole, "owner">) => unknown;
  onRemove?: (userId: string) => unknown;
  onLinkAccessChange?: (access: LinkAccess, role: Exclude<ShareRole, "owner">) => unknown;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

/**
 * Who has access and how: invite by email with a role, change or remove people, set what anyone
 * with the link can do, and copy the link. Pure UI: pass your app's members and handlers. Without
 * handlers it keeps changes locally, so it works as a demo.
 */
export function ShareDialog(props: ShareDialogProps) {
  const { title = "Share", trigger, className } = props;
  const [localMembers, setLocalMembers] = React.useState(sampleMembers);
  const members = props.members ?? localMembers;
  const selfId = props.selfId ?? (props.members ? undefined : sampleSelf.id);
  const [localAccess, setLocalAccess] = React.useState<{ access: LinkAccess; role: Exclude<ShareRole, "owner"> }>({ access: "restricted", role: "viewer" });
  const access = props.linkAccess ?? localAccess.access;
  const linkRole = props.linkRole ?? localAccess.role;
  const [email, setEmail] = React.useState("");
  const [inviteRole, setInviteRole] = React.useState<Exclude<ShareRole, "owner">>("editor");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const id = React.useId();

  const invite = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!EMAIL.test(value)) return setError("Enter an email address, like ada@example.com");
    if (members.some((m) => m.user.email?.toLowerCase() === value.toLowerCase())) return setError(`${value} already has access`);
    setError(null);
    setBusy(true);
    try {
      if (props.onInvite) await props.onInvite(value, inviteRole);
      else setLocalMembers((list) => [...list, { user: { id: `u-${value}`, name: value, email: value }, role: inviteRole, pending: true }]);
      setEmail("");
      toast.success(`Invited ${value}`);
    } catch (err) {
      setError((err as Error).message || "Couldn't send the invite");
    } finally {
      setBusy(false);
    }
  };

  const setRole = (userId: string, role: Exclude<ShareRole, "owner">) => {
    if (props.onRoleChange) void props.onRoleChange(userId, role);
    else setLocalMembers((list) => list.map((m) => (m.user.id === userId ? { ...m, role } : m)));
  };
  const remove = (userId: string) => {
    if (props.onRemove) void props.onRemove(userId);
    else setLocalMembers((list) => list.filter((m) => m.user.id !== userId));
  };
  const setLink = (next: LinkAccess, role: Exclude<ShareRole, "owner">) => {
    if (props.onLinkAccessChange) void props.onLinkAccessChange(next, role);
    else setLocalAccess({ access: next, role });
  };
  const copy = async () => {
    const url = props.link ?? (typeof location === "undefined" ? "" : location.href);
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy the link", { description: url });
    }
  };

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogTrigger asChild>{trigger ?? <Button variant="outline">Share</Button>}</DialogTrigger>
      <DialogContent className={cn("max-w-lg", className)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Invite people by email, or share the link.</DialogDescription>
        </DialogHeader>

        <form onSubmit={invite} className="grid gap-1.5" noValidate>
          <div className="flex gap-2">
            <Input
              type="email"
              aria-label="Email address"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${id}-error` : undefined}
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
            />
            <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as Exclude<ShareRole, "owner">)}>
              <SelectTrigger aria-label="Role for the invite" className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ASSIGNABLE.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABEL[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" isLoading={busy}>
              Invite
            </Button>
          </div>
          {error && (
            <p id={`${id}-error`} role="alert" className="text-xs text-destructive-text">
              {error}
            </p>
          )}
        </form>

        <section aria-label="People with access" className="grid gap-1">
          <h3 className="text-sm font-medium">People with access</h3>
          <ul className="grid gap-1">
            {members.map((m) => {
              const locked = m.role === "owner" || m.user.id === selfId;
              return (
                <li key={m.user.id} className="flex items-center gap-3 py-1.5">
                  <Avatar name={m.user.name} src={m.user.avatar} size="sm" />
                  <span className="grid min-w-0 flex-1">
                    <span className="truncate text-sm font-medium">
                      {m.user.name}
                      {m.user.id === selfId && <span className="font-normal text-muted-foreground"> (you)</span>}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">{m.pending ? "Invited, hasn't joined yet" : m.user.email}</span>
                  </span>
                  {locked ? (
                    <span className="text-sm text-muted-foreground">{ROLE_LABEL[m.role]}</span>
                  ) : (
                    <Select
                      value={m.role}
                      onValueChange={(v) => (v === "remove" ? remove(m.user.id) : setRole(m.user.id, v as Exclude<ShareRole, "owner">))}
                    >
                      <SelectTrigger aria-label={`Role for ${m.user.name}`} size="sm" className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ASSIGNABLE.map((r) => (
                          <SelectItem key={r} value={r}>
                            {ROLE_LABEL[r]}
                          </SelectItem>
                        ))}
                        <SelectItem value="remove" className="text-destructive-text">
                          Remove access
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-label="General access" className="grid gap-2 border-t border-border pt-4">
          <h3 className="text-sm font-medium">General access</h3>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={access} onValueChange={(v) => setLink(v as LinkAccess, linkRole)}>
              <SelectTrigger aria-label="Who can open the link" className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="restricted">Only people with access</SelectItem>
                <SelectItem value="anyone">Anyone with the link</SelectItem>
              </SelectContent>
            </Select>
            {access === "anyone" && (
              <Select value={linkRole} onValueChange={(v) => setLink(access, v as Exclude<ShareRole, "owner">)}>
                <SelectTrigger aria-label="What anyone with the link can do" className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASSIGNABLE.map((r) => (
                    <SelectItem key={r} value={r}>
                      {ROLE_LABEL[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button variant="outline" className="ml-auto" onClick={copy}>
              Copy link
            </Button>
          </div>
        </section>
      </DialogContent>
    </Dialog>
  );
}
