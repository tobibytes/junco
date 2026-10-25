import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  // /preview/ holds the bare frames embedded in the blocks gallery; the gallery pages are the ones to index.
  return { rules: [{ userAgent: "*", allow: "/", disallow: "/preview/" }], sitemap: `${site.url}/sitemap.xml` };
}
