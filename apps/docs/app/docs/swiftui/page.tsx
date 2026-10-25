import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { Pager } from "@/components/docs/pager";
import { C, DataTable, DocHeader, P, Section } from "@/components/docs/prose";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "SwiftUI",
  description: "Junco for iOS, macOS, visionOS, tvOS and watchOS: the same tokens as the web, as Swift values and SwiftUI styles.",
};

export default function SwiftUIPage() {
  return (
    <>
      <DocHeader
        eyebrow="Getting started"
        title="SwiftUI"
        description="The web tokens, generated into Swift, plus SwiftUI styles. Early preview."
      />
      <div className="mt-10 grid gap-12">
        <Section id="install" title="Install">
          <P>
            Add the package in Xcode (File, Add Package Dependencies) with the repo URL, or in <C>Package.swift</C>. It needs iOS
            17, macOS 14, visionOS 1, tvOS 17 or watchOS 10.
          </P>
          <CodeBlock
            title="Package.swift"
            code={`.package(url: "${site.github}", branch: "main")

// in your target:
.product(name: "JuncoUI", package: "junco")`}
          />
          <DataTable
            caption="Products"
            head={["Product", "What it is"]}
            rows={[
              [<C key="1">JuncoTokens</C>, "Plain Swift values: colors (light and dark), spacing, radius, type scale, durations, easing. No UI framework, so it also builds on Linux."],
              [<C key="2">JuncoUI</C>, "SwiftUI colors, fonts, motion and styles for buttons, text fields, toggles, badges, cards and fields. Re-exports JuncoTokens."],
            ]}
          />
        </Section>

        <Section id="tokens" title="Tokens">
          <P>
            Every color is a dynamic SwiftUI <C>Color</C> that flips with light and dark mode, named like the CSS variables
            (<C>--muted-foreground</C> is <C>mutedForeground</C>). Spacing follows the 4pt scale.
          </P>
          <CodeBlock
            code={`import JuncoUI

Text("Revenue")
  .juncoText(JuncoTokens.FontSize.sm)
  .foregroundStyle(Color.junco.mutedForeground)
  .padding(JuncoTokens.Spacing.x(4))        // 16pt, like p-4
  .background(Color.junco.surface)
  .clipShape(RoundedRectangle(cornerRadius: JuncoTokens.Radius.card))`}
          />
          <P>
            The Swift files are generated from <C>packages/tokens/src/tokens.css</C> by <C>pnpm swift:tokens</C>, and CI fails if
            they drift. The contrast pairs are checked again in Swift tests, in both modes.
          </P>
        </Section>

        <Section id="components" title="Components">
          <P>Junco ships as SwiftUI styles, so you keep using the native controls and get their keyboard, focus and VoiceOver support.</P>
          <CodeBlock
            code={`Button("Save") { save() }
  .buttonStyle(.junco)                          // solid, md
Button("Cancel") { }
  .buttonStyle(.junco(.outline, size: .sm))      // solid, outline, soft, ghost, destructive

JuncoField("Email", description: "We never share it.", error: emailError) {
  TextField("you@example.com", text: $email)
    .textFieldStyle(.junco)
}

Toggle("Email alerts", isOn: $alerts)
  .toggleStyle(.junco)

JuncoBadge("Paid", variant: .success, systemImage: "checkmark")

JuncoCard {
  Text("$12,400").juncoText(JuncoTokens.FontSize.xl2, weight: .semibold)
}`}
          />
          <DataTable
            caption="What's in the preview"
            head={["Piece", "API"]}
            rows={[
              ["Button", <C key="b">.buttonStyle(.junco(variant, size:, fullWidth:))</C>],
              ["Text field", <C key="t">.textFieldStyle(.junco)</C>],
              ["Field (label, help, error)", <C key="f">JuncoField(label, description:, error:, isRequired:)</C>],
              ["Switch", <C key="s">.toggleStyle(.junco)</C>],
              ["Badge", <C key="g">JuncoBadge(text, variant:, systemImage:)</C>],
              ["Card", <C key="c">JuncoCard {"{ }"} or .juncoCard()</C>],
            ]}
          />
        </Section>

        <Section id="fonts" title="Fonts">
          <P>
            <C>Font.junco(size, weight:, family:)</C> uses Geist and Geist Mono when your app bundles them (add the .ttf files and
            list them under <C>UIAppFonts</C>), and the system font otherwise. Either way it scales with Dynamic Type.
          </P>
        </Section>

        <Section id="motion" title="Motion">
          <P>
            Animations use the duration and easing tokens. <C>.juncoMotion(.subtle)</C> or <C>.juncoMotion(.off)</C> turns them down
            for a whole view tree, like <C>data-motion</C> on the web, and the system Reduce Motion setting always turns movement off.
          </P>
          <CodeBlock code={`content
  .juncoAnimation(value: isExpanded)
  .juncoMotion(.subtle)`} />
        </Section>
      </div>
      <Pager href="/docs/swiftui/" />
    </>
  );
}
