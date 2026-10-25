import type { MetadataRoute } from "next";
import { allPages } from "@/content/nav";
import { getExamples } from "@/lib/examples";
import { site } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${site.url}/` },
    ...allPages.map((p) => ({ url: `${site.url}${p.href}` })),
    { url: `${site.url}/examples/` },
    ...getExamples().map((e) => ({ url: `${site.url}/examples/${e.slug}/` })),
  ];
}
