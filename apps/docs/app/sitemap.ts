import type { MetadataRoute } from "next";
import { searchablePages } from "@/content/nav";
import { site } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${site.url}/` }, ...searchablePages.map((p) => ({ url: `${site.url}${p.href}` }))];
}
