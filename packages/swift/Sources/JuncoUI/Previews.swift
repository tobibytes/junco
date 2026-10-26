#if canImport(SwiftUI) && DEBUG
import SwiftUI
import JuncoTokens

/// A gallery of every JuncoUI piece. Open this file in Xcode to see it in the canvas, in light and dark.
struct JuncoGallery: View {
  enum Range: Hashable { case day, week, month }

  @State private var email = ""
  @State private var alerts = true
  @State private var range = Range.week
  @State private var editing = false

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
          Button("Disabled") {}.buttonStyle(.junco(.solid, size: .sm)).disabled(true)
        }

        JuncoField("Email", description: "We never share it.", isRequired: true) {
          TextField("you@example.com", text: $email).textFieldStyle(.junco)
        }
        JuncoField("Username", error: "That name is taken.") {
          TextField("tobi", text: .constant("tobi")).textFieldStyle(.junco)
        }

        Toggle("Email alerts", isOn: $alerts).toggleStyle(.junco)
        Toggle("Weekly digest", isOn: .constant(false)).toggleStyle(.junco)

        HStack(spacing: JuncoTokens.Spacing.x(2)) {
          JuncoBadge("Draft")
          JuncoBadge("New", variant: .primary)
          JuncoBadge("Paid", variant: .success, systemImage: "checkmark")
          JuncoBadge("Late", variant: .warning, systemImage: "clock")
          JuncoBadge("Failed", variant: .destructive, systemImage: "xmark")
        }

        JuncoTabs(selection: $range, items: [
          .init("Day", value: .day),
          .init("Week", value: .week),
          .init("Month", value: .month),
        ])

        JuncoCard {
          Text("Revenue").juncoText(JuncoTokens.FontSize.sm).foregroundStyle(Color.junco.mutedForeground)
          Text("$12,400").juncoText(JuncoTokens.FontSize.xl2, weight: .semibold)
          JuncoBadge("+8.2%", variant: .success, systemImage: "arrow.up.right")
        }

        JuncoCard(padding: 0, spacing: 0) {
          JuncoListRow("Notifications", subtitle: "Email and push", systemImage: "bell", value: "On") {}
          JuncoDivider()
          JuncoListRow("Dark mode", systemImage: "moon") {
            Toggle("Dark mode", isOn: .constant(true)).toggleStyle(.junco).labelsHidden()
          }
          JuncoDivider()
          JuncoListRow("Version", value: "1.4.0")
        }

        Button("Edit profile") { editing = true }.buttonStyle(.junco(.outline))
      }
      .padding(JuncoTokens.Spacing.x(6))
    }
    .background(Color.junco.background)
    .juncoSheet(isPresented: $editing, title: "Edit profile", description: "Visible to your team.") {
      SheetSample()
    }
  }
}

/// What `.juncoSheet` shows, as a standalone preview.
struct JuncoSheetGallery: View {
  var body: some View {
    JuncoSheetPanel(title: "Edit profile", description: "Visible to your team.") {
      SheetSample()
    }
  }
}

private struct SheetSample: View {
  @State private var name = "Tobi"

  var body: some View {
    JuncoField("Name") {
      TextField("Name", text: $name).textFieldStyle(.junco)
    }
    Button("Save changes") {}.buttonStyle(.junco(.solid, fullWidth: true))
  }
}

struct JuncoGallery_Previews: PreviewProvider {
  static var previews: some View {
    Group {
      JuncoGallery().preferredColorScheme(.light).previewDisplayName("Light")
      JuncoGallery().preferredColorScheme(.dark).previewDisplayName("Dark")
      JuncoSheetGallery().preferredColorScheme(.light).previewDisplayName("Sheet, light")
      JuncoSheetGallery().preferredColorScheme(.dark).previewDisplayName("Sheet, dark")
    }
  }
}
#endif
