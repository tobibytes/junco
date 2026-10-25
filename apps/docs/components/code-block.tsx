"use client";

import { Button, Tooltip } from "@junco/react";
import { cn } from "@/lib/cn";
import * as React from "react";
import { tokenize, type Lang } from "@/lib/highlight";
import { CheckIcon, CopyIcon } from "./icons";

export function useCopy(timeout = 1600) {
  const [copied, setCopied] = React.useState(false);
  const copy = React.useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), timeout);
      } catch {
        // Clipboard blocked (insecure context, permissions). Nothing else to do.
      }
    },
    [timeout],
  );
  return { copied, copy };
}

export function CopyButton({ text, className, label = "Copy code" }: { text: string; className?: string; label?: string }) {
  const { copied, copy } = useCopy();
  return (
    <Tooltip content={copied ? "Copied" : label}>
      <Button
        variant="ghost"
        size="icon"
        aria-label={copied ? "Copied" : label}
        onClick={() => copy(text)}
        className={cn("size-7 text-muted-foreground hover:text-foreground", className)}
      >
        {copied ? <CheckIcon width={14} height={14} /> : <CopyIcon width={14} height={14} />}
      </Button>
    </Tooltip>
  );
}

export function Highlighted({ code, lang }: { code: string; lang: Lang }) {
  const tokens = React.useMemo(() => tokenize(code, lang), [code, lang]);
  return (
    <>
      {tokens.map((t, i) =>
        t.type === "plain" ? (
          <React.Fragment key={i}>{t.text}</React.Fragment>
        ) : (
          <span key={i} className={`tok-${t.type}`}>
            {t.text}
          </span>
        ),
      )}
    </>
  );
}

export interface CodeBlockProps {
  code: string;
  lang?: Lang;
  /** Shown in the top bar, e.g. a file name. */
  title?: string;
  className?: string;
  /** Drop the outer border and radius, for use inside another frame. */
  bare?: boolean;
}

export function CodeBlock({ code, lang = "tsx", title, className, bare = false }: CodeBlockProps) {
  const trimmed = code.replace(/^\n+|\s+$/g, "");
  return (
    <div
      className={cn(
        "group/code relative bg-(--code-bg) text-[13px] leading-6",
        !bare && "overflow-hidden rounded-card border border-border",
        className,
      )}
    >
      {title && (
        <div className="flex h-9 items-center justify-between border-b border-border pr-1.5 pl-4 font-mono text-xs text-muted-foreground">
          <span>{title}</span>
          <CopyButton text={trimmed} />
        </div>
      )}
      {!title && <CopyButton text={trimmed} className="absolute top-2 right-2 z-10 bg-(--code-bg)" />}
      {/* Focusable so keyboard users can scroll long lines. */}
      <pre tabIndex={0} className="overflow-x-auto p-4 pr-12 font-mono focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring">
        <code>
          <Highlighted code={trimmed} lang={lang} />
        </code>
      </pre>
    </div>
  );
}
