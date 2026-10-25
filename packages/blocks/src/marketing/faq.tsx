import * as React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, cn } from "junco";
import { Reveal } from "@junco/motion";
import { defaultFaq, type FaqItem } from "./content";
import { Container, Section, SectionHeading } from "./layout";
import { MarketingLink } from "./link";

export interface FaqProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  items?: FaqItem[];
  /** "split" puts the heading on the left on wide screens; "centered" stacks it. */
  variant?: "split" | "centered";
  /** Where to send people who didn't find their answer. */
  contact?: { label: string; href: string } | null;
  classNames?: { root?: string; list?: string };
}

/** Frequently asked questions as an accordion. Closed answers stay in the HTML, so search engines see them. */
export function Faq({
  eyebrow = "FAQ",
  title = "Questions, answered",
  description,
  items = defaultFaq,
  variant = "split",
  contact = { label: "Talk to us", href: "/contact" },
  className,
  classNames,
  ...props
}: FaqProps) {
  const isSplit = variant === "split";
  return (
    <Section className={cn(classNames?.root, className)} {...props}>
      <Container size={isSplit ? "lg" : "sm"} className={cn(isSplit && "grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16")}>
        <div className={cn(isSplit && "lg:sticky lg:top-24 lg:self-start")}>
          <SectionHeading
            eyebrow={eyebrow}
            title={title}
            align={isSplit ? "start" : "center"}
            description={
              description ??
              (contact && (
                <>
                  Can't find what you're looking for?{" "}
                  <MarketingLink href={contact.href} className="font-medium text-foreground underline underline-offset-4 hover:text-primary">
                    {contact.label}
                  </MarketingLink>
                  .
                </>
              ))
            }
          />
        </div>
        <Reveal delay={100} className={cn(!isSplit && "mt-10", classNames?.list)}>
          <Accordion type="single" collapsible>
            {items.map((item, i) => (
              <AccordionItem key={item.question} value={`q-${i}`}>
                <AccordionTrigger className="text-[15px]">{item.question}</AccordionTrigger>
                <AccordionContent forceMount className="data-[state=closed]:hidden" classNames={{ inner: "text-[15px] leading-7" }}>
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </Container>
    </Section>
  );
}
