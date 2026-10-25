import { DocsShell } from "@/components/docs/docs-shell";

export default function ComponentsLayout({ children }: { children: React.ReactNode }) {
  return <DocsShell>{children}</DocsShell>;
}
