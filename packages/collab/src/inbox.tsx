import { Avatar, Button, cn, EmptyState, Popover, PopoverContent, PopoverTrigger } from "@junco/react";
import { When } from "./comments";
import { sampleNotifications } from "./fake";
import { BellIcon } from "./icons";
import { useCollabAdapter, useCollabState } from "./provider";
import type { CollabNotification } from "./types";

export interface InboxButtonProps {
  /** Newest first. Default: from `CollabProvider`, or sample notifications. */
  notifications?: CollabNotification[];
  /** When someone picks a notification. It's marked read first. */
  onOpen?: (notification: CollabNotification) => void;
  onMarkRead?: (ids?: string[]) => unknown;
  className?: string;
  classNames?: { trigger?: string; content?: string; item?: string };
}

/** A bell with an unread count that opens the list of mentions and replies. */
export function InboxButton(props: InboxButtonProps) {
  const state = useCollabState();
  const adapter = useCollabAdapter();
  const list = props.notifications ?? state?.notifications ?? sampleNotifications;
  const markRead = props.onMarkRead ?? adapter?.markRead;
  const unread = list.filter((n) => !n.read).length;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" aria-label={unread ? `Inbox, ${unread} unread` : "Inbox"} className={cn("relative", props.className, props.classNames?.trigger)}>
          <BellIcon className="size-4" />
          {unread > 0 && (
            <span aria-hidden className="absolute -top-1 -right-1 grid min-w-4 place-items-center rounded-pill bg-primary px-1 text-[10px] leading-4 font-medium text-primary-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className={cn("grid w-80 gap-2 p-2", props.classNames?.content)}>
        <div className="flex items-center justify-between px-2 pt-1">
          <span className="text-sm font-medium">Inbox</span>
          {unread > 0 && markRead && (
            <Button size="sm" variant="ghost" onClick={() => markRead()}>
              Mark all read
            </Button>
          )}
        </div>
        {list.length === 0 ? (
          <EmptyState icon={<BellIcon className="size-5" />} title="Nothing yet" description="Mentions and replies to your threads show up here." />
        ) : (
          <ul className="grid max-h-96 gap-1 overflow-y-auto">
            {list.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  className={cn(
                    "grid w-full gap-1 rounded-control p-2 text-left text-sm hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring",
                    props.classNames?.item,
                  )}
                  onClick={() => {
                    if (!n.read) void markRead?.([n.id]);
                    props.onOpen?.(n);
                  }}
                >
                  <span className="flex items-center gap-2">
                    {!n.read && <span role="img" aria-label="Unread:" className="size-2 shrink-0 rounded-pill bg-primary" />}
                    <span aria-hidden>
                      <Avatar name={n.actor.name} src={n.actor.avatar} size="xs" />
                    </span>
                    <span>
                      <span className="font-medium">{n.actor.name}</span>{" "}
                      <span className="text-muted-foreground">{n.kind === "mention" ? "mentioned you" : "replied"}</span>
                    </span>
                  </span>{" "}
                  <span className="line-clamp-2 text-muted-foreground">{n.excerpt}</span>{" "}
                  <When at={n.createdAt} className="text-xs text-muted-foreground" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
