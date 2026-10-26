import { useParams } from "react-router";
import {
  BlogIndexPage,
  BlogPostPage,
  ChangelogPage,
  defaultPosts,
  LandingPage,
  PricingPage,
} from "@junco/blocks/marketing";
import { app, brand, marketingNav } from "../config";
import { marketingSlots as slots } from "../layouts";
import { NotFound } from "./errors";

const postHref = (post: { slug: string }) => `/blog/${post.slug}`;

export function Home() {
  return (
    <LandingPage
      brand={brand}
      nav={marketingNav}
      hero={{
        title: app.description,
        description: app.pitch,
        primaryAction: { label: "Start for free", href: "/signup" },
        secondaryAction: { label: "See pricing", href: "/pricing" },
        announcement: { label: "See what's new", href: "/changelog", tag: "New" },
      }}
      cta={{ primaryAction: { label: "Start for free", href: "/signup" }, secondaryAction: { label: "See pricing", href: "/pricing" } }}
      slots={slots}
    />
  );
}

export function Pricing() {
  return <PricingPage brand={brand} nav={marketingNav} slots={slots} />;
}

export function Changelog() {
  return <ChangelogPage brand={brand} nav={marketingNav} rssHref={null} slots={slots} />;
}

export function Blog() {
  return <BlogIndexPage brand={brand} nav={marketingNav} getHref={postHref} slots={slots} />;
}

export function BlogPost() {
  const { slug } = useParams();
  const post = defaultPosts.find((p) => p.slug === slug);
  if (!post) return <NotFound />;
  return <BlogPostPage brand={brand} nav={marketingNav} post={post} backHref="/blog" getHref={postHref} slots={slots} />;
}
