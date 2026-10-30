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
            17, macOS 14, visionOS 1, tvOS 17 or watchOS 10. Versions are git tags; before 1.0 a minor bump can break, so pin to the
            minor version.
          </P>
          <CodeBlock
            title="Package.swift"
            code={`.package(url: "${site.github}", .upToNextMinor(from: "0.1.0"))

// in your target:
.product(name: "JuncoUI", package: "junco")`}
          />
          <DataTable
            caption="Products"
            head={["Product", "What it is"]}
            rows={[
              [<C key="1">JuncoTokens</C>, "Plain Swift values: colors (light and dark), spacing, radius, type scale, durations, easing. No UI framework, so it also builds on Linux."],
              [<C key="2">JuncoUI</C>, "SwiftUI colors, fonts, motion, and styles for buttons, text fields, toggles, badges, cards, fields, sheets, segmented tabs and list rows. Re-exports JuncoTokens."],
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
              ["Sheet", <C key="sh">.juncoSheet(isPresented:, title:, description:, detents:) {"{ }"}</C>],
              ["Tabs (segmented)", <C key="tb">JuncoTabs(selection:, items:, fullWidth:)</C>],
              ["List row", <C key="lr">JuncoListRow(title, subtitle:, systemImage:, value:, action:)</C>],
              ["Focus ring", <C key="fr">.juncoFocusRing(isFocused, cornerRadius:)</C>],
            ]}
          />
        </Section>

        <Section id="sheet" title="Sheet">
          <P>
            The system sheet with Junco&apos;s popover surface, a titled header and a close button VoiceOver reads as
            &quot;Close&quot;. It snaps to the detents you pass (medium and large by default) and drags to dismiss, like the web
            Sheet&apos;s bottom placement on phones. Use <C>JuncoSheetPanel</C> on its own when you present with{" "}
            <C>.sheet(item:)</C>.
          </P>
          <CodeBlock
            code={`Button("Edit profile") { editing = true }
  .buttonStyle(.junco(.outline))
  .juncoSheet(isPresented: $editing, title: "Edit profile", description: "Visible to your team.") {
    JuncoField("Name") {
      TextField("Name", text: $name).textFieldStyle(.junco)
    }
    Button("Save changes") { save() }.buttonStyle(.junco(.solid, fullWidth: true))
  }`}
          />
        </Section>

        <Section id="tabs" title="Tabs">
          <P>
            Segmented tabs for switching views in the same space, like <C>{'<Tabs variant="segmented">'}</C>. The selected tab gets
            a raised surface and a border, so it doesn&apos;t rely on color, and VoiceOver hears &quot;Selected&quot;. The
            indicator slides with Junco&apos;s timing and stays still with Reduce Motion.
          </P>
          <CodeBlock
            code={`enum Range: Hashable { case day, week, month }
@State private var range = Range.week

JuncoTabs(selection: $range, items: [
  .init("Day", value: .day),
  .init("Week", value: .week),
  .init("Month", value: .month, systemImage: "calendar"),
])`}
          />
        </Section>

        <Section id="list-rows" title="List rows">
          <P>
            Settings-style rows, at least 44pt tall. Pass <C>action</C> for a row that navigates (it gets a chevron and the button
            trait), <C>value</C> for read-only details, or a trailing control. VoiceOver reads each row as one element. Stack rows
            in a card with <C>JuncoDivider()</C> between them, or put them in a system <C>List</C>.
          </P>
          <CodeBlock
            code={`JuncoCard(padding: 0, spacing: 0) {
  JuncoListRow("Notifications", subtitle: "Email and push", systemImage: "bell", value: "On") {
    path.append(.notifications)
  }
  JuncoDivider()
  JuncoListRow("Dark mode", systemImage: "moon") {
    Toggle("Dark mode", isOn: $dark).toggleStyle(.junco).labelsHidden()
  }
  JuncoDivider()
  JuncoListRow("Version", value: "1.4.0")
}`}
          />
          <P>
            <C>.labelsHidden()</C> on a Junco switch needs iOS 18 or macOS 15. On older systems the label still shows, so leave
            it off the switch&apos;s label there or pass an empty label with an <C>.accessibilityLabel</C>.
          </P>
        </Section>

        <Section id="accessibility" title="Accessibility">
          <P>
            The styles keep the native controls, so VoiceOver, Dynamic Type and keyboard navigation work as usual. Custom styles
            lose the system focus indicator, so Junco draws the web&apos;s focus ring instead: 2pt of <C>--ring</C>, 2pt outside the
            control, whenever it has keyboard focus (iPad keyboards, Full Keyboard Access, macOS, tvOS). Status never relies on
            color alone: badges take an icon, field errors come with an icon and are read out, the switch shows state by the thumb
            position, and the selected tab is raised.
          </P>
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
