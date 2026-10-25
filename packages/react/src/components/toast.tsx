import * as React from "react";
import { tv } from "tailwind-variants";
import { cn } from "../lib/cn";
import { CircleCheckIcon, CircleXIcon, InfoIcon, TriangleAlertIcon, XIcon } from "../lib/icons";
import { Spinner } from "./spinner";

/* ------------------------------------------------------------------------------------------------
 * Store: a tiny module-level queue so `toast()` works from anywhere, no hook or provider needed.
 * ----------------------------------------------------------------------------------------------*/

export type ToastType = "default" | "success" | "error" | "warning" | "info" | "loading";
export type ToastId = string | number;

export interface ToastAction {
  label: React.ReactNode;
  /** Runs, then the toast closes. Call `event.preventDefault()` to keep it open. */
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export interface ToastOptions {
  /** Reuse an id to update a toast in place instead of adding a new one. */
  id?: ToastId;
  description?: React.ReactNode;
  /** Milliseconds before it closes. `Infinity` keeps it open. Loading toasts never auto-close. */
  duration?: number;
  action?: ToastAction;
  /** Whether the user can close it (close button, swipe, Esc). Default true. */
  dismissible?: boolean;
  /** Text for screen readers when title/description aren't plain strings. */
  ariaLabel?: string;
  onDismiss?: (toast: ToastData) => void;
  onAutoClose?: (toast: ToastData) => void;
  className?: string;
}

export interface ToastData extends ToastOptions {
  id: ToastId;
  type: ToastType;
  title: React.ReactNode;
  /** Bumps on every update so timers restart. */
  version: number;
  dismissed: boolean;
}

type Listener = () => void;

const EXIT_MS = 200;
let counter = 0;
let toasts: ToastData[] = [];
const listeners = new Set<Listener>();

function emit() {
  toasts = [...toasts];
  for (const l of listeners) l();
}

function upsert(type: ToastType, title: React.ReactNode, options: ToastOptions = {}): ToastId {
  const existing = options.id !== undefined ? toasts.find((t) => t.id === options.id) : undefined;
  if (existing) {
    toasts = toasts.map((t) =>
      t.id === existing.id ? { ...t, ...options, type, title, version: t.version + 1, dismissed: false } : t,
    );
  } else {
    const id = options.id ?? ++counter;
    toasts = [{ ...options, id, type, title, version: 0, dismissed: false }, ...toasts];
  }
  emit();
  return options.id ?? toasts[0]!.id;
}

function remove(id: ToastId) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

function dismiss(id?: ToastId, reason: "dismiss" | "auto" = "dismiss") {
  const targets = toasts.filter((t) => (id === undefined || t.id === id) && !t.dismissed);
  if (!targets.length) return;
  toasts = toasts.map((t) => (targets.includes(t) ? { ...t, dismissed: true } : t));
  emit();
  for (const t of targets) {
    if (reason === "auto") t.onAutoClose?.(t);
    else t.onDismiss?.(t);
    setTimeout(() => remove(t.id), EXIT_MS);
  }
}

type PromiseMessage<T> = React.ReactNode | ((value: T) => React.ReactNode);

export interface ToastPromiseOptions<T> extends Omit<ToastOptions, "id"> {
  loading: React.ReactNode;
  success: PromiseMessage<T>;
  error: PromiseMessage<unknown>;
}

function resolveMessage<T>(message: PromiseMessage<T>, value: T): React.ReactNode {
  return typeof message === "function" ? (message as (v: T) => React.ReactNode)(value) : message;
}

/**
 *   toast("Saved")
 *   toast.success("Invoice sent", { description: "Northwind will get it in a minute." })
 *   toast.error("Couldn't save", { action: { label: "Retry", onClick: save } })
 *   toast.promise(upload(), { loading: "Uploading…", success: "Uploaded", error: "Upload failed" })
 *   toast.dismiss(id)
 */
export const toast = Object.assign((title: React.ReactNode, options?: ToastOptions) => upsert("default", title, options), {
  success: (title: React.ReactNode, options?: ToastOptions) => upsert("success", title, options),
  error: (title: React.ReactNode, options?: ToastOptions) => upsert("error", title, options),
  warning: (title: React.ReactNode, options?: ToastOptions) => upsert("warning", title, options),
  info: (title: React.ReactNode, options?: ToastOptions) => upsert("info", title, options),
  loading: (title: React.ReactNode, options?: ToastOptions) => upsert("loading", title, options),
  /** Shows a loading toast that turns into success or error. Returns the original promise. */
  promise<T>(promise: Promise<T> | (() => Promise<T>), { loading, success, error, ...options }: ToastPromiseOptions<T>) {
    const id = upsert("loading", loading, options);
    const p = typeof promise === "function" ? promise() : promise;
    p.then(
      (value) => upsert("success", resolveMessage(success, value), { ...options, id }),
      (reason: unknown) => upsert("error", resolveMessage(error, reason), { ...options, id }),
    );
    return p;
  },
  dismiss: (id?: ToastId) => dismiss(id),
});

/** @internal Clears every toast immediately. For tests. */
export function __resetToasts() {
  toasts = [];
  emit();
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
const getSnapshot = () => toasts;

/** Read the current toasts, e.g. to build a custom toaster. */
export function useToasts(): ToastData[] {
  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/* ------------------------------------------------------------------------------------------------
 * Toaster
 * ----------------------------------------------------------------------------------------------*/

export type ToasterPosition = "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";

export const toastVariants = tv({
  slots: {
    viewport: "fixed z-toast w-[min(24rem,calc(100vw-2rem))] outline-none",
    list: "relative m-0 list-none p-0 transition-[height] duration-slow ease-standard",
    item: [
      "absolute inset-x-0 transition-[transform,opacity] duration-slow ease-standard outline-none",
      "animate-toast-in data-[dismissed=true]:animate-toast-out data-[dismissed=true]:pointer-events-none",
    ],
    toast: [
      "flex items-start gap-3 rounded-card border border-border bg-popover p-4 text-popover-foreground shadow-float",
      "touch-pan-y transition-[translate,opacity] duration-base ease-standard",
    ],
    icon: "mt-px shrink-0 [&_svg]:size-4",
    content: "grid min-w-0 flex-1 gap-0.5",
    title: "text-sm leading-5 font-medium",
    description: "text-sm leading-5 text-muted-foreground",
    action: [
      "ml-1 inline-flex h-7 shrink-0 items-center rounded-control bg-primary px-2.5 text-xs font-medium text-primary-foreground",
      "transition-colors duration-fast ease-standard hover:bg-primary/90",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    ],
    close: [
      "-mt-1 -mr-1 grid size-6 shrink-0 place-items-center rounded-control text-muted-foreground",
      "transition-colors duration-fast ease-standard hover:bg-accent hover:text-foreground",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    ],
  },
  variants: {
    type: {
      default: { icon: "hidden" },
      success: { icon: "text-success-text" },
      error: { icon: "text-destructive-text" },
      warning: { icon: "text-warning-text" },
      info: { icon: "text-primary" },
      loading: { icon: "text-muted-foreground" },
    },
  },
});

const icons: Record<ToastType, React.ReactNode> = {
  default: null,
  success: <CircleCheckIcon />,
  error: <CircleXIcon />,
  warning: <TriangleAlertIcon />,
  info: <InfoIcon />,
  loading: <Spinner label={null} size="sm" className="size-4" />,
};

/** Words read before the message, so the type never depends on the icon color. */
const typeWords: Record<ToastType, string> = {
  default: "",
  success: "Success",
  error: "Error",
  warning: "Warning",
  info: "Info",
  loading: "Loading",
};

const positions: Record<ToasterPosition, string> = {
  "top-left": "top-4 left-4",
  "top-center": "top-4 left-1/2 -translate-x-1/2",
  "top-right": "top-4 right-4",
  "bottom-left": "bottom-4 left-4",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
  "bottom-right": "bottom-4 right-4",
};

export interface ToasterProps {
  position?: ToasterPosition;
  /** How many toasts show at once; older ones wait behind. Default 3. */
  visibleToasts?: number;
  /** Default auto-close time in ms. Default 5000. */
  duration?: number;
  /** Always show the full stack instead of collapsing it until hover or focus. */
  expand?: boolean;
  /** Show the × button. Default true. */
  closeButton?: boolean;
  /** Keys that move focus to the toasts. Default Alt+T. */
  hotkey?: string[];
  gap?: number;
  className?: string;
  classNames?: Partial<Record<keyof typeof toastVariants.slots, string>>;
}

function plainText(node: React.ReactNode): string {
  return typeof node === "string" || typeof node === "number" ? String(node) : "";
}

/** Put one <Toaster /> near the root of your app, then call `toast()` anywhere. */
export function Toaster({
  position = "bottom-right",
  visibleToasts = 3,
  duration = 5000,
  expand = false,
  closeButton = true,
  hotkey = ["altKey", "KeyT"],
  gap = 12,
  className,
  classNames,
}: ToasterProps) {
  const all = useToasts();
  const [heights, setHeights] = React.useState<Record<string, number>>({});
  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const [announcement, setAnnouncement] = React.useState({ polite: "", assertive: "" });
  const viewportRef = React.useRef<HTMLElement>(null);
  const announced = React.useRef(new Map<ToastId, number>());

  const expanded = expand || hovered || focused;
  const isTop = position.startsWith("top");
  const align = position.endsWith("left") ? "left" : position.endsWith("right") ? "right" : "center";

  // Announce each new toast or update once, through live regions that are always mounted.
  React.useEffect(() => {
    for (const t of all) {
      if (t.dismissed || announced.current.get(t.id) === t.version) continue;
      announced.current.set(t.id, t.version);
      const text =
        t.ariaLabel ?? [typeWords[t.type], plainText(t.title), plainText(t.description)].filter(Boolean).join(": ");
      if (text) {
        setAnnouncement((a) =>
          t.type === "error" ? { ...a, assertive: text } : { ...a, polite: text },
        );
      }
    }
    for (const id of announced.current.keys()) if (!all.some((t) => t.id === id)) announced.current.delete(id);
  }, [all]);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const match = hotkey.every((key) => (e as unknown as Record<string, unknown>)[key] === true || e.code === key);
      if (match) {
        e.preventDefault();
        const first = viewportRef.current?.querySelector<HTMLElement>('li[tabindex="0"]');
        (first ?? viewportRef.current)?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [hotkey]);

  const setHeight = React.useCallback((id: ToastId, h: number) => {
    setHeights((prev) => (prev[String(id)] === h ? prev : { ...prev, [String(id)]: h }));
  }, []);

  const live = all.filter((t) => !t.dismissed);
  const styles = toastVariants();
  const frontHeight = heights[String(live[0]?.id)] ?? 0;
  const shown = live.slice(0, visibleToasts);
  const listHeight = expanded
    ? shown.reduce((sum, t) => sum + (heights[String(t.id)] ?? 0), 0) + gap * Math.max(0, shown.length - 1)
    : frontHeight + Math.min(shown.length - 1, 2) * 10;

  return (
    <section
      ref={viewportRef}
      aria-label={`Notifications (${hotkey.map((k) => k.replace(/^Key/, "").replace(/Key$/, "")).join("+")})`}
      tabIndex={-1}
      className={styles.viewport({ className: cn(positions[position], classNames?.viewport, className) })}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
    >
      <span aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement.polite}
      </span>
      <span aria-live="assertive" aria-atomic="true" className="sr-only">
        {announcement.assertive}
      </span>
      <ol className={styles.list({ className: classNames?.list })} style={{ height: listHeight }}>
        {all.map((t) => {
          // A closing toast keeps its slot while it fades out.
          const order = t.dismissed ? all.filter((x) => !x.dismissed || x === t) : live;
          const index = order.indexOf(t);
          const newer = order.slice(0, index);
          const offset = expanded
            ? newer.reduce((sum, n) => sum + (heights[String(n.id)] ?? 0), 0) + gap * newer.length
            : Math.min(index, 2) * 10;
          const hidden = index >= visibleToasts;
          return (
            <ToastItem
              key={t.id}
              toast={t}
              index={index}
              offset={offset}
              isTop={isTop}
              align={align}
              expanded={expanded}
              hidden={hidden}
              frontHeight={frontHeight}
              duration={duration}
              paused={expanded}
              closeButton={closeButton}
              classNames={classNames}
              onHeight={setHeight}
            />
          );
        })}
      </ol>
    </section>
  );
}

interface ToastItemProps {
  toast: ToastData;
  index: number;
  offset: number;
  isTop: boolean;
  align: "left" | "right" | "center";
  expanded: boolean;
  hidden: boolean;
  frontHeight: number;
  duration: number;
  paused: boolean;
  closeButton: boolean;
  classNames?: ToasterProps["classNames"];
  onHeight: (id: ToastId, height: number) => void;
}

function ToastItem({
  toast: t,
  index,
  offset,
  isTop,
  align,
  expanded,
  hidden,
  frontHeight,
  duration,
  paused,
  closeButton,
  classNames,
  onHeight,
}: ToastItemProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const swipe = React.useRef<{ x: number; t: number; dx: number } | null>(null);
  const [swipeX, setSwipeX] = React.useState(0);
  const [documentHidden, setDocumentHidden] = React.useState(false);
  const styles = toastVariants({ type: t.type });
  const dismissible = t.dismissible !== false;

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    onHeight(t.id, el.offsetHeight);
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => onHeight(t.id, el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [t.id, onHeight]);

  React.useEffect(() => {
    const onVisibility = () => setDocumentHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Auto-close, pausing while the stack is hovered or focused, or the tab is hidden.
  const remaining = React.useRef(0);
  React.useEffect(() => {
    remaining.current = t.duration ?? duration;
  }, [t.version, t.duration, duration]);
  React.useEffect(() => {
    if (t.type === "loading" || t.dismissed || paused || documentHidden) return;
    const ms = remaining.current;
    if (!Number.isFinite(ms)) return;
    const started = Date.now();
    const timer = setTimeout(() => dismiss(t.id, "auto"), ms);
    return () => {
      clearTimeout(timer);
      remaining.current = Math.max(0, ms - (Date.now() - started));
    };
  }, [t.id, t.type, t.version, t.dismissed, paused, documentHidden]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dismissible || (e.target as HTMLElement).closest("button")) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    swipe.current = { x: e.clientX, t: performance.now(), dx: 0 };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!swipe.current) return;
    let dx = e.clientX - swipe.current.x;
    if (align === "right") dx = Math.max(0, dx);
    if (align === "left") dx = Math.min(0, dx);
    swipe.current.dx = dx;
    setSwipeX(dx);
  };
  const onPointerUp = () => {
    const s = swipe.current;
    swipe.current = null;
    if (!s) return;
    const velocity = Math.abs(s.dx) / Math.max(1, performance.now() - s.t);
    if (Math.abs(s.dx) > 60 || velocity > 0.4) {
      setSwipeX(Math.sign(s.dx || 1) * (ref.current?.offsetWidth ?? 400));
      dismiss(t.id);
    } else {
      setSwipeX(0);
    }
  };

  const isFront = index === 0;
  const behind = !expanded && index > 0;
  const scale = behind ? 1 - Math.min(index, 2) * 0.05 : 1;
  const y = isTop ? offset : -offset;

  return (
    <li
      tabIndex={hidden ? -1 : 0}
      aria-hidden={hidden || undefined}
      data-type={t.type}
      data-dismissed={t.dismissed}
      data-front={isFront || undefined}
      className={styles.item({ className: cn(isTop ? "top-0 [--toast-from:-100%]" : "bottom-0 [--toast-from:100%]", t.className) })}
      style={{
        transform: `translateY(${y}px) scale(${scale})`,
        transformOrigin: isTop ? "bottom center" : "top center",
        opacity: hidden ? 0 : 1,
        pointerEvents: hidden ? "none" : undefined,
        zIndex: 100 - Math.max(0, index),
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape" && dismissible) {
          e.stopPropagation();
          dismiss(t.id);
        }
      }}
    >
      <div
        ref={ref}
        className={styles.toast({ className: classNames?.toast })}
        style={{
          translate: swipeX ? `${swipeX}px 0` : undefined,
          opacity: swipeX ? Math.max(0, 1 - Math.abs(swipeX) / 200) : undefined,
          transition: swipe.current ? "none" : undefined,
          // Collapsed toasts behind the front one take its height and hide their text.
          height: behind && frontHeight ? frontHeight : undefined,
          overflow: behind ? "hidden" : undefined,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <span className={styles.icon({ className: cn(behind && "invisible", classNames?.icon) })} aria-hidden>
          {icons[t.type]}
        </span>
        <div className={styles.content({ className: cn(behind && "invisible", classNames?.content) })}>
          {t.type !== "default" && <span className="sr-only">{typeWords[t.type]}: </span>}
          <div className={styles.title({ className: classNames?.title })}>{t.title}</div>
          {t.description && <div className={styles.description({ className: classNames?.description })}>{t.description}</div>}
        </div>
        {t.action && (
          <button
            type="button"
            className={styles.action({ className: cn(behind && "invisible", classNames?.action) })}
            onClick={(e) => {
              t.action?.onClick(e);
              if (!e.defaultPrevented) dismiss(t.id);
            }}
          >
            {t.action.label}
          </button>
        )}
        {closeButton && dismissible && (
          <button
            type="button"
            aria-label="Dismiss notification"
            className={styles.close({ className: cn(behind && "invisible", classNames?.close) })}
            onClick={() => dismiss(t.id)}
          >
            <XIcon className="size-3.5" />
          </button>
        )}
      </div>
    </li>
  );
}
