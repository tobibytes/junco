# Junco for Swift

Junco's design tokens and SwiftUI styles for iOS 17+, macOS 14+, visionOS, tvOS and watchOS. Same tokens as the web, so native apps match the site. Early preview.

```swift
.package(url: "https://github.com/tobibytes/junco", branch: "main")
// target dependency:
.product(name: "JuncoUI", package: "junco")
```

```swift
import JuncoUI

Button("Save") { }.buttonStyle(.junco)
TextField("Email", text: $email).textFieldStyle(.junco)
Toggle("Alerts", isOn: $on).toggleStyle(.junco)
JuncoBadge("Paid", variant: .success, systemImage: "checkmark")
JuncoTabs(selection: $range, items: [.init("Day", value: .day), .init("Week", value: .week)])
JuncoListRow("Notifications", systemImage: "bell", value: "On") { open() }
view.juncoSheet(isPresented: $editing, title: "Edit profile") { form }
Text("Hi").foregroundStyle(Color.junco.mutedForeground)
```

| Module | Contents |
| --- | --- |
| `JuncoTokens` | Plain Swift values (colors light + dark, spacing, radius, type, motion). No UI framework, builds on Linux. |
| `JuncoUI` | SwiftUI `Color.junco.*`, `Font.junco(...)`, motion helpers, button / text field / toggle styles, `JuncoField`, `JuncoBadge`, `JuncoCard`, `.juncoSheet` / `JuncoSheetPanel`, `JuncoTabs`, `JuncoListRow`, `JuncoDivider`, `.juncoFocusRing`. |

## Working on it

- `Package.swift` is at the repo root so SwiftPM can install from the GitHub URL. Sources live here.
- `Sources/JuncoTokens/Tokens.generated.swift` and `Sources/JuncoUI/Palette.generated.swift` come from `packages/tokens/src/tokens.css`. Run `pnpm swift:tokens` after changing tokens; CI runs it with `--check`.
- `swift build && swift test` from the repo root. On Linux only JuncoTokens has code; the SwiftUI files compile on Apple platforms (CI runs them on macOS).
- Open `Package.swift` in Xcode and `Sources/JuncoUI/Previews.swift` shows every piece in light and dark.
- Without Xcode's canvas, render the previews to PNGs on a simulator:
  `TEST_RUNNER_JUNCO_SNAPSHOT_DIR=/tmp/shots xcodebuild test -scheme Junco-Package -destination 'platform=iOS Simulator,name=iPhone 17 Pro' -only-testing:JuncoUITests/GallerySnapshotTests`

Docs: https://junco.madebytobi.com/docs/swiftui/
