import { zodResolver } from "@hookform/resolvers/zod";
import { Container } from "@junco/blocks/marketing";
import { confetti, Reveal } from "@junco/motion";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Input,
  Label,
  Radio,
  RadioGroup,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Switch,
  toast,
} from "@junco/react";
import { Form, FormField, FormRootError, FormSubmit, useForm } from "@junco/react/form";
import * as React from "react";
import { z } from "zod";
import { levels, tracks } from "./data";
import { ArrowLeftIcon, CalendarIcon, CheckIcon } from "./icons";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your full name"),
  email: z.email("Enter a valid email, like you@school.edu"),
  school: z.string().trim().min(2, "Which school do you go to?"),
  level: z.enum(levels, { message: "Pick your level of study" }),
  track: z.enum(["ai", "fintech", "health", "civic", "climate", "beginner"], { message: "Pick the track you're most excited about" }),
  teamSize: z.enum(["solo", "2", "3", "4"]),
  dietary: z.string().trim().max(200, "Keep it under 200 characters").optional(),
  firstHackathon: z.boolean(),
  conduct: z.literal(true, { message: "You need to agree to the code of conduct to attend" }),
});

type Values = z.infer<typeof schema>;

const teamOptions = [
  { value: "solo", label: "Solo" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
] as const;

const perks = [
  "Free meals, snacks and swag all weekend",
  "Travel stipends if you're more than 100 miles away",
  "A mentor for your team, on call until 2 AM",
  "Interviews with sponsor teams for top projects",
];

function Success({ name, onReset }: { name: string; onReset: () => void }) {
  const first = name.split(" ")[0];
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  React.useEffect(() => headingRef.current?.focus(), []);
  return (
    <Card className="overflow-hidden">
      <CardHeader className="items-start gap-3 p-6 sm:p-8">
        <span className="grid size-12 place-items-center rounded-pill bg-success text-success-foreground">
          <CheckIcon className="size-6" />
        </span>
        <CardTitle as="h2" ref={headingRef} tabIndex={-1} className="text-2xl tracking-tight outline-none">
          You're in, {first}!
        </CardTitle>
        <CardDescription className="text-base">
          We sent a confirmation to your email. Watch your inbox in March for the hacker guide, Discord invite and your
          QR code for check-in.
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="flex flex-wrap gap-3 p-6 sm:px-8">
        <Button asChild>
          <a href="data:text/calendar;charset=utf-8,BEGIN:VCALENDAR%0AVERSION:2.0%0ABEGIN:VEVENT%0ASUMMARY:HackHarbor 2027%0ADTSTART:20270409T200000Z%0ADTEND:20270411T190000Z%0ALOCATION:Harborview University, Seattle MD%0AEND:VEVENT%0AEND:VCALENDAR" download="hackharbor-2027.ics">
            <CalendarIcon className="size-4" />
            Add to calendar
          </a>
        </Button>
        <Button asChild variant="outline">
          <a href="#/">Back to the event</a>
        </Button>
        <Button variant="ghost" onClick={onReset}>
          Register someone else
        </Button>
      </CardContent>
    </Card>
  );
}

export function RegisterPage() {
  const [done, setDone] = React.useState<string | null>(null);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", school: "", teamSize: "solo", dietary: "", firstHackathon: false, conduct: false as unknown as true },
  });

  async function onSubmit(values: Values) {
    // A real site would POST to its API here.
    await new Promise((r) => setTimeout(r, 900));
    if (values.email.endsWith("@taken.example")) {
      form.setError("root", { message: "That email is already registered. Check your inbox for the confirmation." });
      return;
    }
    toast.success("You're registered for HackHarbor", { description: "See you in Seattle on April 9." });
    void confetti({ from: document.querySelector("form[aria-label=Registration] button[type=submit]") });
    setDone(values.name);
  }

  return (
    <div className="relative isolate">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] [background:radial-gradient(60%_60%_at_50%_0%,color-mix(in_oklch,var(--primary)_16%,transparent),transparent)]"
      />
      <Container className="grid gap-10 py-12 sm:py-16 lg:grid-cols-[1fr_1.25fr] lg:gap-16">
        <Reveal className="grid content-start gap-6">
          <a href="#/" className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeftIcon className="size-4" />
            Back to HackHarbor
          </a>
          <div className="grid gap-3">
            <h1 className="text-4xl font-semibold tracking-tighter text-balance sm:text-5xl">Register for HackHarbor 2027</h1>
            <p className="text-lg text-pretty text-muted-foreground">
              April 9 to 11 in Seattle. Free for every student, and you don't need a team or an idea yet.
            </p>
          </div>
          <ul className="grid gap-3">
            {perks.map((p) => (
              <li key={p} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-pill bg-primary/12 text-primary">
                  <CheckIcon className="size-3.5" />
                </span>
                {p}
              </li>
            ))}
          </ul>
          <div className="rounded-card border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">500 spots, 381 taken</p>
            <div className="mt-2.5 h-2 overflow-hidden rounded-pill bg-border" role="progressbar" aria-valuemin={0} aria-valuemax={500} aria-valuenow={381} aria-label="Spots taken">
              <div className="h-full rounded-pill bg-primary" style={{ width: `${(381 / 500) * 100}%` }} />
            </div>
            <p className="mt-2.5">Registration closes March 26 or when we're full.</p>
          </div>
        </Reveal>

        <Reveal delay={120}>
          {done ? (
            <Success name={done} onReset={() => { form.reset(); setDone(null); }} />
          ) : (
            <Card>
              <CardHeader className="p-6 pb-0 sm:p-8 sm:pb-0">
                <CardTitle as="h2" className="text-lg">
                  Your details
                </CardTitle>
                <CardDescription>Fields marked * are required. We never share your information.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 sm:p-8">
                <Form form={form} onSubmit={onSubmit} aria-label="Registration">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <FormField name="name" label="Full name" isRequired>
                      <Input autoComplete="name" placeholder="First and last name" />
                    </FormField>
                    <FormField name="email" label="Email" isRequired description="Your school email works best.">
                      <Input type="email" autoComplete="email" placeholder="you@school.edu" />
                    </FormField>
                    <FormField name="school" label="School" isRequired>
                      <Input autoComplete="organization" placeholder="Where you study" />
                    </FormField>
                    <FormField name="level" label="Level of study" isRequired>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose one" />
                        </SelectTrigger>
                        <SelectContent>
                          {levels.map((l) => (
                            <SelectItem key={l} value={l}>
                              {l}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>
                  </div>
                  <FormField name="track" label="Track you're most excited about" isRequired description="You can change it at the event.">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a track" />
                      </SelectTrigger>
                      <SelectContent>
                        {tracks.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                  <FormField name="teamSize" label="Team size, including you">
                    <RadioGroup orientation="horizontal" className="flex flex-wrap gap-2">
                      {teamOptions.map((o) => (
                        <Label
                          key={o.value}
                          htmlFor={`team-${o.value}`}
                          className="flex h-10 min-w-16 cursor-pointer items-center justify-center gap-2 rounded-control border border-border px-3 text-sm transition-colors duration-fast ease-standard hover:bg-accent has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/8"
                        >
                          <Radio id={`team-${o.value}`} value={o.value} />
                          {o.label}
                        </Label>
                      ))}
                    </RadioGroup>
                  </FormField>
                  <FormField name="dietary" label="Dietary needs" description="Vegetarian, halal, kosher, allergies. Leave blank if none.">
                    <Input placeholder="e.g. vegetarian, nut allergy" />
                  </FormField>
                  <Separator />
                  <FormField name="firstHackathon" label="This is my first hackathon">
                    <Switch />
                  </FormField>
                  <FormField name="conduct" label="I agree to the HackHarbor code of conduct and photo policy" isRequired>
                    <Checkbox />
                  </FormField>
                  <FormRootError />
                  <FormSubmit size="lg" className="w-full">
                    Register
                  </FormSubmit>
                </Form>
              </CardContent>
            </Card>
          )}
        </Reveal>
      </Container>
    </div>
  );
}
