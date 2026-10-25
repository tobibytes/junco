import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { MotionDemo } from "@/components/docs/motion-demo";
import { Pager } from "@/components/docs/pager";
import { C, DataTable, DocHeader, P, Section } from "@/components/docs/prose";

export const metadata: Metadata = {
  title: "Dark mode and motion",
  description: "Light, dark and system themes, and one switch for all motion.",
};

export default function DarkModePage() {
  return (
    <>
      <DocHeader
        eyebrow="Getting started"
        title="Dark mode and motion"
        description="Light and dark ship together. One switch for motion; reduced motion always wins."
      />
      <div className="mt-10 grid gap-12">
        <Section id="dark" title="Dark mode">
          <P>
            Dark values apply under <C>.dark</C> or <C>[data-theme=&quot;dark&quot;]</C> on any ancestor, usually <C>&lt;html&gt;</C>.
            Without React, set the class yourself. With React, <Link className="text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary" href="/components/theme-provider/">ThemeProvider</Link>{" "}
            handles light, dark and system, remembers the choice, and follows the OS when set to system.
          </P>
          <CodeBlock
            code={`import { useTheme } from "junco";

const { theme, resolvedTheme, setTheme } = useTheme();
setTheme("system"); // "light" | "dark" | "system"`}
          />
          <P>
            To stop server-rendered pages flashing the wrong theme, add <C>themeScript()</C> (from{" "}
            <C>junco/server</C>) as an inline script in <C>&lt;head&gt;</C>. It reads the saved choice before the first
            paint. Until it has read it, <C>useTheme().isMounted</C> is false, so toggles can avoid showing a wrong
            selected state.
          </P>
        </Section>

        <Section id="motion" title="The motion switch">
          <P>
            Set <C>data-motion</C> on <C>&lt;html&gt;</C> (or call <C>setMotion</C>). Every Junco duration is multiplied by{" "}
            <C>--motion-scale</C>, so one attribute turns all motion down.
          </P>
          <DataTable
            caption="Motion levels"
            head={["Value", "--motion-scale", "What happens"]}
            rows={[
              [<C key="a">full</C>, "1", "Everything animates at full distance and speed."],
              [<C key="b">subtle</C>, "0.6", "Shorter and smaller: less travel, quicker fades."],
              [<C key="c">off</C>, "0", "No movement. Spinners keep turning, slower, because they carry meaning."],
              ["reduced motion", "0", "The OS setting always wins, even over data-motion=\"full\"."],
            ]}
          />
          <MotionDemo />
        </Section>

        <Section id="your-own" title="In your own CSS">
          <P>Use the duration utilities and they scale for free, or multiply by the variable yourself:</P>
          <CodeBlock
            lang="css"
            code={`.panel {
  transition: transform calc(var(--duration-base) * var(--motion-scale)) var(--ease-enter);
}`}
          />
        </Section>
      </div>
      <Pager href="/docs/dark-mode/" />
    </>
  );
}
