import * as React from "react";
import {
  Avatar,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  EmptyState,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  toast,
} from "junco";
import { DataTable, type ColumnDef } from "junco/data-table";
import { renderSlot, type Slots } from "../../lib/slots";
import { ActivityFeed, NowProvider, PageContainer, PageHeader, TimeAgo, useMediaQuery, usePageNow } from "../blocks";
import { fakeActivity, type ActivityItem } from "../fake-data";
import { MailIcon, MoreHorizontalIcon, PlusIcon, UsersIcon } from "../icons";
import { ConfirmDialog, InviteDialog, RoleBadge, UserStatusBadge, type InviteValues } from "../user-blocks";
import { fakeSessions, fakeUsers, userRoles, type AppUser, type Session, type UserRole } from "../users-data";

let inviteSeq = 0;

/** Local state for a list of users, so pages work with fake data or as controlled lists. */
function useUserList(users: AppUser[] | undefined, onUsersChange?: (users: AppUser[]) => void) {
  const [inner, setInner] = React.useState<AppUser[]>(() => users ?? fakeUsers());
  const list = users ?? inner;
  const set = (next: AppUser[]) => {
    if (users === undefined) setInner(next);
    onUsersChange?.(next);
  };
  return [list, set] as const;
}

export interface UserActionsProps {
  user: AppUser;
  userHref?: (user: AppUser) => string;
  onRoleChange: (user: AppUser, role: UserRole) => void;
  onResend: (user: AppUser) => void;
  onRemove: (user: AppUser) => void;
}

/** The "…" menu on a user row. */
export function UserActions({ user, userHref, onRoleChange, onResend, onRemove }: UserActionsProps) {
  const [confirm, setConfirm] = React.useState(false);
  const isOwner = user.role === "Owner";
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8" aria-label={`Actions for ${user.name}`}>
            <MoreHorizontalIcon className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
          {userHref && (
            <DropdownMenuItem asChild>
              <a href={userHref(user)}>View profile</a>
            </DropdownMenuItem>
          )}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger disabled={isOwner}>Change role</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup value={user.role} onValueChange={(r) => onRoleChange(user, r as UserRole)}>
                {userRoles
                  .filter((r) => r !== "Owner")
                  .map((r) => (
                    <DropdownMenuRadioItem key={r} value={r}>
                      {r}
                    </DropdownMenuRadioItem>
                  ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          {user.status === "invited" && (
            <DropdownMenuItem onSelect={() => onResend(user)}>Resend invite</DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="danger" disabled={isOwner} onSelect={() => setConfirm(true)}>
            {user.status === "invited" ? "Revoke invite" : "Remove from workspace"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        isDanger
        title={user.status === "invited" ? `Revoke the invite for ${user.email}?` : `Remove ${user.name}?`}
        description={
          user.status === "invited"
            ? "The link in their email will stop working."
            : "They lose access right away. Their work stays in the workspace."
        }
        confirmLabel={user.status === "invited" ? "Revoke invite" : "Remove"}
        onConfirm={() => onRemove(user)}
      />
    </>
  );
}

export function useUserColumns(actions: Omit<UserActionsProps, "user">): ColumnDef<AppUser>[] {
  return React.useMemo<ColumnDef<AppUser>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => {
          const u = row.original;
          const name = actions.userHref ? (
            <a
              href={actions.userHref(u)}
              className="truncate font-medium text-foreground underline-offset-4 hover:underline focus-visible:rounded-xs focus-visible:outline-2 focus-visible:outline-ring"
            >
              {u.name}
            </a>
          ) : (
            <span className="truncate font-medium">{u.name}</span>
          );
          return (
            <div className="flex min-w-40 items-center gap-3">
              <Avatar name={u.name} src={u.avatarUrl} size="sm" />
              <div className="grid min-w-0">
                {name}
                <span className="truncate text-xs text-muted-foreground">{u.email}</span>
              </div>
            </div>
          );
        },
        filterFn: (row, _id, value: string) => {
          const q = String(value).toLowerCase();
          return row.original.name.toLowerCase().includes(q) || row.original.email.toLowerCase().includes(q);
        },
      },
      { accessorKey: "role", header: "Role", cell: ({ row }) => <RoleBadge role={row.original.role} /> },
      { accessorKey: "status", header: "Status", cell: ({ row }) => <UserStatusBadge status={row.original.status} /> },
      {
        accessorKey: "lastActiveAt",
        header: "Last active",
        sortingFn: "datetime",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-muted-foreground">
            {row.original.lastActiveAt ? <TimeAgo iso={row.original.lastActiveAt} /> : "Never"}
          </span>
        ),
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        enableSorting: false,
        enableHiding: false,
        meta: { align: "right" },
        cell: ({ row }) => <UserActions user={row.original} {...actions} />,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [actions.userHref, actions.onRoleChange, actions.onRemove, actions.onResend],
  );
}

export type UsersSlots = {
  header: { title: string; count: number; onInvite: () => void };
};

export interface UsersPageProps {
  users?: AppUser[];
  onUsersChange?: (users: AppUser[]) => void;
  /** Called after the invite form validates. Throw to show an error in the dialog. */
  onInvite?: (values: InviteValues) => void | Promise<void>;
  /** Link for a user's profile. Default "#/users/<id>". Pass null to hide the links. */
  userHref?: ((user: AppUser) => string) | null;
  title?: string;
  /** Clock for relative times. Defaults to real time with real data, the fake clock with fake data. */
  now?: number;
  /** "table": full data table. "cards": a list of cards (good for small teams and phones). */
  variant?: "table" | "cards";
  slots?: Slots<UsersSlots>;
  className?: string;
}

function UsersHeader({ count, onInvite, title }: UsersSlots["header"]) {
  return (
    <PageHeader
      title={title}
      description={`${count} people in this workspace.`}
      actions={
        <Button onClick={onInvite} aria-haspopup="dialog">
          <PlusIcon className="size-4" />
          Invite people
        </Button>
      }
    />
  );
}

/** Everyone in the workspace: search, filter by role, invite, change roles, remove. */
export function UsersPage({
  users,
  onUsersChange,
  onInvite,
  userHref = (u) => `#/users/${u.id}`,
  title = "Users",
  variant = "table",
  now: nowProp,
  slots,
  className,
}: UsersPageProps) {
  const now = usePageNow(nowProp, users !== undefined);
  const [list, setList] = useUserList(users, onUsersChange);
  const [roleFilter, setRoleFilter] = React.useState<UserRole | "all">("all");
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const listRef = React.useRef(list);
  listRef.current = list;

  const onRoleChange = React.useCallback(
    (user: AppUser, role: UserRole) => {
      setList(listRef.current.map((u) => (u.id === user.id ? { ...u, role } : u)));
      toast.success(`${user.name} is now ${role === "Admin" ? "an" : "a"} ${role}`);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const onResend = React.useCallback(
    (user: AppUser) => toast.success("Invite sent again", { description: user.email }),
    [],
  );
  const onRemove = React.useCallback(
    (user: AppUser) => {
      const before = listRef.current;
      setList(before.filter((u) => u.id !== user.id));
      toast(user.status === "invited" ? "Invite revoked" : `${user.name} removed`, {
        action: { label: "Undo", onClick: () => setList(before) },
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const columns = useUserColumns({ userHref: userHref ?? undefined, onRoleChange, onResend, onRemove });
  // Phones start with fewer columns; the Columns menu can still bring them back.
  const isPhone = useMediaQuery("(max-width: 639px)");
  const [visibility, setVisibility] = React.useState<Record<string, boolean>>({});
  const columnVisibility = { ...(isPhone ? { role: false, lastActiveAt: false } : {}), ...visibility };
  const filtered = roleFilter === "all" ? list : list.filter((u) => u.role === roleFilter);

  const invite = async (values: InviteValues) => {
    if (onInvite) await onInvite(values);
    const joinedAt = new Date(now).toISOString();
    const added: AppUser[] = values.emails.map((email) => ({
      id: `inv_${++inviteSeq}_${email}`,
      name: email
        .split("@")[0]!
        .replace(/[._-]+/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      email,
      role: values.role,
      status: "invited",
      joinedAt,
    }));
    setList([...added, ...listRef.current]);
    toast.success(values.emails.length === 1 ? "Invite sent" : `${values.emails.length} invites sent`, {
      description: values.emails.join(", "),
    });
  };

  const roleSelect = (
    <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as UserRole | "all")}>
      <SelectTrigger aria-label="Filter by role" className="w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All roles</SelectItem>
        {userRoles.map((r) => (
          <SelectItem key={r} value={r}>
            {r}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  const empty = (
    <EmptyState
      icon={<UsersIcon />}
      title={roleFilter === "all" ? "No one here yet" : `No ${roleFilter.toLowerCase()}s`}
      description={
        roleFilter === "all" ? "Invite your team to start working together." : "Try another role or clear the filter."
      }
      actions={
        roleFilter === "all" ? (
          <Button onClick={() => setInviteOpen(true)}>Invite people</Button>
        ) : (
          <Button variant="outline" onClick={() => setRoleFilter("all")}>
            Clear filter
          </Button>
        )
      }
    />
  );

  return (
    <NowProvider value={now}>
      <PageContainer className={className}>
        {renderSlot(slots, "header", UsersHeader, {
          title,
          count: list.length,
          onInvite: () => setInviteOpen(true),
        })}
        {variant === "table" ? (
          <DataTable
            columns={columns}
            data={filtered}
            getRowId={(u) => u.id}
            caption="Users"
            enableGlobalFilter
            searchPlaceholder="Search name or email"
            enableColumnVisibility
            columnVisibility={columnVisibility}
            onColumnVisibilityChange={setVisibility}
            toolbar={roleSelect}
            emptyState={empty}
            tableOptions={{
              globalFilterFn: (row, _id, value: string) => {
                const q = String(value).toLowerCase();
                return row.original.name.toLowerCase().includes(q) || row.original.email.toLowerCase().includes(q);
              },
            }}
          />
        ) : (
          <div className="grid gap-4">
            <div className="flex justify-end">{roleSelect}</div>
            {filtered.length === 0 ? (
              empty
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((u) => (
                  <li key={u.id}>
                    <Card className="h-full">
                      <CardContent className="flex items-start gap-3 pt-5">
                        <Avatar name={u.name} src={u.avatarUrl} />
                        <div className="grid min-w-0 flex-1 gap-1">
                          <span className="truncate font-medium">{u.name}</span>
                          <span className="truncate text-xs text-muted-foreground">{u.email}</span>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            <RoleBadge role={u.role} />
                            <UserStatusBadge status={u.status} />
                          </div>
                        </div>
                        <UserActions
                          user={u}
                          userHref={userHref ?? undefined}
                          onRoleChange={onRoleChange}
                          onResend={onResend}
                          onRemove={onRemove}
                        />
                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        <InviteDialog open={inviteOpen} onOpenChange={setInviteOpen} onInvite={invite} />
      </PageContainer>
    </NowProvider>
  );
}

/* ------------------------------------------------------------------ User detail */

export type UserDetailSlots = {
  profile: { user: AppUser };
  activity: { items: ActivityItem[] };
  sessions: { sessions: Session[] };
};

export interface UserDetailPageProps {
  user?: AppUser;
  activity?: ActivityItem[];
  sessions?: Session[];
  backHref?: string;
  onSuspend?: (user: AppUser) => void | Promise<void>;
  onMessage?: (user: AppUser) => void;
  /** Clock for relative times. Defaults to real time with a real user, the fake clock otherwise. */
  now?: number;
  slots?: Slots<UserDetailSlots>;
  className?: string;
}

function ProfileCard({ user }: UserDetailSlots["profile"]) {
  const rows: Array<[string, React.ReactNode]> = [
    [
      "Email",
      <a key="e" href={`mailto:${user.email}`} title={user.email} className="underline-offset-4 hover:underline">
        {user.email}
      </a>,
    ],
    ["Role", <RoleBadge key="r" role={user.role} />],
    ["Status", <UserStatusBadge key="s" status={user.status} />],
    ["Title", user.title ?? "None"],
    ["Location", user.location ?? "Unknown"],
    [
      "Joined",
      user.joinedAt
        ? new Date(user.joinedAt).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
            timeZone: "UTC",
          })
        : "Not yet",
    ],
    ["Last active", user.lastActiveAt ? <TimeAgo key="t" iso={user.lastActiveAt} /> : "Never"],
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle as="h2">Details</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-3 text-sm">
          {rows.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[7rem_1fr] items-center gap-2">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="min-w-0 truncate">{v}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}

function ActivityCard({ items }: UserDetailSlots["activity"]) {
  return (
    <Card>
      <CardHeader>
        <CardTitle as="h2">Recent activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ActivityFeed items={items} />
      </CardContent>
    </Card>
  );
}

function SessionsCard({ sessions }: UserDetailSlots["sessions"]) {
  return (
    <Card>
      <CardHeader>
        <CardTitle as="h2">Sessions</CardTitle>
        <CardDescription>Devices signed in to this account.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-border">
          {sessions.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div className="grid min-w-0 text-sm">
                <span className="truncate font-medium">
                  {s.device}
                  {s.isCurrent && <span className="ml-2 text-xs font-normal text-success-text">Active now</span>}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {s.location} · <TimeAgo iso={s.lastActiveAt} />
                </span>
              </div>
              {!s.isCurrent && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toast.success("Signed out", { description: s.device })}
                >
                  Sign out
                </Button>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

/** One person: details, activity and sessions, with message and suspend actions. */
export function UserDetailPage({
  user: userProp,
  activity,
  sessions,
  backHref = "#/users",
  onSuspend,
  onMessage,
  now: nowProp,
  slots,
  className,
}: UserDetailPageProps) {
  const now = usePageNow(nowProp, userProp !== undefined);
  const [user, setUser] = React.useState<AppUser>(() => userProp ?? fakeUsers()[1]!);
  React.useEffect(() => {
    if (userProp) setUser(userProp);
  }, [userProp]);
  const [confirm, setConfirm] = React.useState(false);
  const isSuspended = user.status === "suspended";
  const items = React.useMemo(
    () => activity ?? fakeActivity(5, 31).map((a) => ({ ...a, actor: { name: user.name, avatarUrl: user.avatarUrl } })),
    [activity, user.name, user.avatarUrl],
  );

  return (
    <NowProvider value={now}>
      <PageContainer className={className}>
        <PageHeader
          breadcrumb={[{ label: "Users", href: backHref }, { label: user.name }]}
          title={
            <span className="flex min-w-0 items-center gap-3">
              <Avatar name={user.name} src={user.avatarUrl} size="lg" />
              <span className="grid min-w-0">
                <span className="truncate">{user.name}</span>
                <span className="truncate text-sm font-normal tracking-normal text-muted-foreground">
                  {user.title ?? user.email}
                </span>
              </span>
            </span>
          }
          actions={
            <>
              <Button
                variant="outline"
                onClick={() => (onMessage ? onMessage(user) : toast(`Opening a message to ${user.name}`))}
              >
                <MailIcon className="size-4" />
                Message
              </Button>
              <Button
                variant={isSuspended ? "outline" : "danger"}
                disabled={user.role === "Owner"}
                onClick={() => setConfirm(true)}
              >
                {isSuspended ? "Reactivate" : "Suspend"}
              </Button>
            </>
          }
        />
        <div className={cn("grid gap-6 lg:grid-cols-3")}>
          <div className="grid content-start gap-6">{renderSlot(slots, "profile", ProfileCard, { user })}</div>
          <div className="grid min-w-0 content-start gap-6 lg:col-span-2">
            {renderSlot(slots, "activity", ActivityCard, { items })}
            {renderSlot(slots, "sessions", SessionsCard, { sessions: sessions ?? fakeSessions() })}
          </div>
        </div>
        <ConfirmDialog
          open={confirm}
          onOpenChange={setConfirm}
          isDanger={!isSuspended}
          title={isSuspended ? `Reactivate ${user.name}?` : `Suspend ${user.name}?`}
          description={
            isSuspended
              ? "They can sign in again right away."
              : "They're signed out everywhere and can't sign in until you reactivate them."
          }
          confirmLabel={isSuspended ? "Reactivate" : "Suspend"}
          onConfirm={async () => {
            await onSuspend?.(user);
            setUser({ ...user, status: isSuspended ? "active" : "suspended" });
            toast.success(isSuspended ? `${user.name} reactivated` : `${user.name} suspended`);
          }}
        />
      </PageContainer>
    </NowProvider>
  );
}
