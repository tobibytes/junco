#if canImport(SwiftUI)
import SwiftUI
import JuncoTokens

/// A settings-style row: optional icon, title, subtitle, and a trailing value, chevron or control.
/// Rows are at least 44pt tall. VoiceOver reads the row as one element ("Notifications, Email and
/// push, On, Button"). Stack them in a `JuncoCard(padding: 0, spacing: 0)` with `JuncoDivider()`
/// between, or use them inside a system `List`.
///
///     JuncoListRow("Notifications", subtitle: "Email and push", systemImage: "bell", value: "On") { openNotifications() }
///     JuncoListRow("Version", value: "1.4.0")
///     JuncoListRow("Dark mode", systemImage: "moon") { Toggle("Dark mode", isOn: $dark).toggleStyle(.junco).labelsHidden() }
public struct JuncoListRow<Accessory: View>: View {
  let title: String
  let subtitle: String?
  let systemImage: String?
  let value: String?
  let action: (() -> Void)?
  let accessory: Accessory

  public var body: some View {
    if let action {
      Button(action: action) { content(showsChevron: true) }
        .buttonStyle(JuncoListRowButtonStyle())
    } else if Accessory.self == EmptyView.self {
      content(showsChevron: false)
        .accessibilityElement(children: .combine)
    } else {
      content(showsChevron: false)
        .accessibilityElement(children: .contain)
    }
  }

  private func content(showsChevron: Bool) -> some View {
    let c = Color.junco
    return HStack(spacing: JuncoTokens.Spacing.x(3)) {
      if let systemImage {
        Image(systemName: systemImage)
          .font(.junco(JuncoTokens.FontSize.sm, weight: .medium))
          .foregroundStyle(c.foreground)
          .frame(width: JuncoTokens.Spacing.x(8), height: JuncoTokens.Spacing.x(8))
          .background(RoundedRectangle(cornerRadius: JuncoTokens.Radius.control, style: .continuous).fill(c.muted))
          .accessibilityHidden(true)
      }
      VStack(alignment: .leading, spacing: 2) {
        Text(title)
          .font(.junco(JuncoTokens.FontSize.sm, weight: .medium))
          .foregroundStyle(c.foreground)
        if let subtitle {
          Text(subtitle)
            .font(.junco(JuncoTokens.FontSize.sm))
            .foregroundStyle(c.mutedForeground)
        }
      }
      Spacer(minLength: JuncoTokens.Spacing.x(2))
      if let value {
        Text(value)
          .font(.junco(JuncoTokens.FontSize.sm))
          .foregroundStyle(c.mutedForeground)
      }
      accessory
      if showsChevron {
        Image(systemName: "chevron.right")
          .font(.junco(JuncoTokens.FontSize.xs, weight: .semibold))
          .foregroundStyle(c.mutedForeground)
          .accessibilityHidden(true)
      }
    }
    .padding(.horizontal, JuncoTokens.Spacing.x(4))
    .padding(.vertical, JuncoTokens.Spacing.x(2))
    .frame(maxWidth: .infinity, minHeight: 44, alignment: .leading)
    .contentShape(Rectangle())
  }
}

public extension JuncoListRow where Accessory == EmptyView {
  /// A row that shows information, or navigates when you pass `action` (adds a chevron).
  init(
    _ title: String,
    subtitle: String? = nil,
    systemImage: String? = nil,
    value: String? = nil,
    action: (() -> Void)? = nil
  ) {
    self.title = title
    self.subtitle = subtitle
    self.systemImage = systemImage
    self.value = value
    self.action = action
    self.accessory = EmptyView()
  }
}

public extension JuncoListRow {
  /// A row with a trailing control, like a switch. Give the control its own label for VoiceOver.
  init(
    _ title: String,
    subtitle: String? = nil,
    systemImage: String? = nil,
    @ViewBuilder accessory: () -> Accessory
  ) {
    self.title = title
    self.subtitle = subtitle
    self.systemImage = systemImage
    self.value = nil
    self.action = nil
    self.accessory = accessory()
  }
}

/// A 1pt `--border` line for separating rows.
public struct JuncoDivider: View {
  public init() {}

  public var body: some View {
    Rectangle().fill(Color.junco.border).frame(height: 1).accessibilityHidden(true)
  }
}

private struct JuncoListRowButtonStyle: ButtonStyle {
  func makeBody(configuration: Configuration) -> some View {
    JuncoListRowBody(configuration: configuration)
  }
}

private struct JuncoListRowBody: View {
  let configuration: ButtonStyleConfiguration

  @Environment(\.isEnabled) private var isEnabled
  @Environment(\.isFocused) private var isFocused

  var body: some View {
    configuration.label
      .background(configuration.isPressed ? Color.junco.accent : .clear)
      .opacity(isEnabled ? 1 : 0.5)
      .juncoFocusRing(isFocused, cornerRadius: JuncoTokens.Radius.card)
  }
}
#endif
