import { Button } from "junco";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto grid max-w-md flex-1 content-center justify-items-center gap-4 px-4 py-24 text-center">
      <p className="font-mono text-sm text-muted-foreground">404</p>
      <h1 className="text-3xl font-semibold tracking-tighter">This page doesn&apos;t exist</h1>
      <p className="text-muted-foreground">
        It may have moved, or the link is wrong. Try search with <kbd className="kbd">/</kbd>, or head back.
      </p>
      <div className="flex gap-2">
        <Button asChild>
          <Link href="/">Home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/components/">Components</Link>
        </Button>
      </div>
    </div>
  );
}
