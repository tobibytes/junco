#if canImport(SwiftUI) && DEBUG
import SwiftUI
import JuncoTokens

/// A gallery of every JuncoUI piece. Open this file in Xcode to see it in the canvas, in light and dark.
struct JuncoGallery: View {
  @State private var email = ""
  @State private var alerts = true

  var body: some View {
    ScrollView {
      VStack(alignment: .leading, spacing: JuncoTokens.Spacing.x(6)) {
        Text("Junco for SwiftUI").juncoText(JuncoTokens.FontSize.xl2, weight: .semibold)

        HStack(spacing: JuncoTokens.Spacing.x(2)) {
          Button("Save") {}.buttonStyle(.junco)
          Button("Cancel") {}.buttonStyle(.junco(.outline))
          Button("More") {}.buttonStyle(.junco(.ghost))
        }
        HStack(spacing: JuncoTokens.Spacing.x(2)) {
          Button("Soft") {}.buttonStyle(.junco(.soft, size: .sm))
          Button("Delete", role: .destructive) {}.buttonStyle(.junco(.destructive, size: .sm))
          Button("Disabled") {}.buttonStyle(.junco).disabled(true)
        }

        JuncoField("Email", description: "We never share it.", isRequired: true) {
          TextField("you@example.com", text: $email).textFieldStyle(.junco)
        }
        JuncoField("Username", error: "That name is taken.") {
          TextField("tobi", text: .constant("tobi")).textFieldStyle(.junco)
        }

        Toggle("Email alerts", isOn: $alerts).toggleStyle(.junco)

        HStack(spacing: JuncoTokens.Spacing.x(2)) {
          JuncoBadge("Draft")
          JuncoBadge("New", variant: .primary)
          JuncoBadge("Paid", variant: .success, systemImage: "checkmark")
          JuncoBadge("Late", variant: .warning, systemImage: "clock")
          JuncoBadge("Failed", variant: .destructive, systemImage: "xmark")
        }

        JuncoCard {
          Text("Revenue").juncoText(JuncoTokens.FontSize.sm).foregroundStyle(Color.junco.mutedForeground)
          Text("$12,400").juncoText(JuncoTokens.FontSize.xl2, weight: .semibold)
          JuncoBadge("+8.2%", variant: .success, systemImage: "arrow.up.right")
        }
      }
      .padding(JuncoTokens.Spacing.x(6))
    }
    .background(Color.junco.background)
  }
}

struct JuncoGallery_Previews: PreviewProvider {
  static var previews: some View {
    Group {
      JuncoGallery().preferredColorScheme(.light).previewDisplayName("Light")
      JuncoGallery().preferredColorScheme(.dark).previewDisplayName("Dark")
    }
  }
}
#endif
