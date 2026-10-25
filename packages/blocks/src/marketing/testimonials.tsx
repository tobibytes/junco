import * as React from "react";
import { Avatar, cn } from "junco";
import { Marquee, Reveal } from "@junco/motion";
import { defaultTestimonials, type Testimonial } from "./content";
import { Container, Section, SectionHeading } from "./layout";

export interface TestimonialsProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  testimonials?: Testimonial[];
  /** "grid" is a masonry wall; "marquee" is two rows drifting in opposite directions. */
  variant?: "grid" | "marquee";
  classNames?: { root?: string; card?: string };
}

export function TestimonialCard({ testimonial, className }: { testimonial: Testimonial; className?: string }) {
  return (
    <figure className={cn("flex flex-col gap-5 rounded-card border border-border bg-card p-6", className)}>
      <blockquote className="text-[15px] leading-7 text-pretty text-foreground">
        <p>“{testimonial.quote}”</p>
      </blockquote>
      <figcaption className="mt-auto flex items-center gap-3">
        <Avatar name={testimonial.name} src={testimonial.avatar} size="sm" />
        <span className="grid">
          <span className="text-sm font-medium">{testimonial.name}</span>
          <span className="text-xs text-muted-foreground">{testimonial.title}</span>
        </span>
      </figcaption>
    </figure>
  );
}

/** Quotes from customers. */
export function Testimonials({
  eyebrow = "Customers",
  title = "Teams switch to Orbit and stay",
  description,
  testimonials = defaultTestimonials,
  variant = "grid",
  className,
  classNames,
  ...props
}: TestimonialsProps) {
  const half = Math.ceil(testimonials.length / 2);
  return (
    <Section className={cn("overflow-hidden", classNames?.root, className)} {...props}>
      <Container>
        {title && <SectionHeading eyebrow={eyebrow} title={title} description={description} />}
      </Container>
      {variant === "grid" ? (
        <Container>
          <Reveal stagger className="mt-14 columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4 [&>*]:break-inside-avoid">
            {testimonials.map((t) => (
              <TestimonialCard key={t.name} testimonial={t} className={classNames?.card} />
            ))}
          </Reveal>
        </Container>
      ) : (
        <div className="mt-14 grid gap-4">
          {[testimonials.slice(0, half), testimonials.slice(half)].map((row, i) => (
            <Marquee key={i} direction={i ? "right" : "left"} duration={60} gap="1rem">
              <div className="flex shrink-0 gap-4 [[data-static]_&]:shrink [[data-static]_&]:flex-wrap [[data-static]_&]:justify-center [[data-static]_&]:px-4">
                {row.map((t) => (
                  <TestimonialCard key={t.name} testimonial={t} className={cn("w-[22rem] max-w-[80vw]", classNames?.card)} />
                ))}
              </div>
            </Marquee>
          ))}
        </div>
      )}
    </Section>
  );
}
