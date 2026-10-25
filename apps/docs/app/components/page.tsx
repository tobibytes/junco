import type { Metadata } from "next";
import { ComponentGrid } from "@/components/docs/component-grid";
import { Pager } from "@/components/docs/pager";
import { DocHeader } from "@/components/docs/prose";
import { components } from "@/content/components";

export const metadata: Metadata = {
  title: "Components",
  description: "Every Junco component, with live previews, props and code for all four levels.",
};

export default function ComponentsIndex() {
  return (
    <>
      <DocHeader
        title="Components"
        description={`${components.length} components so far, each usable as semantic classes, utilities, copy-in source or an installed package.`}
      />
      <div className="mt-10">
        <ComponentGrid />
      </div>
      <Pager href="/components/" />
    </>
  );
}
