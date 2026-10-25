#if canImport(SwiftUI)
import SwiftUI
import JuncoTokens

private struct JuncoFieldInvalidKey: EnvironmentKey {
  static let defaultValue = false
}

public extension EnvironmentValues {
  /// True inside a `JuncoField` that has an error. `.textFieldStyle(.junco)` draws a red border.
  var juncoFieldInvalid: Bool {
    get { self[JuncoFieldInvalidKey.self] }
    set { self[JuncoFieldInvalidKey.self] = newValue }
  }
}

/// Junco's text input look: an 8pt bordered box that shows the `--ring` color when focused.
///
///     TextField("Email", text: $email).textFieldStyle(.junco)
public struct JuncoTextFieldStyle: TextFieldStyle {
  public init() {}

  public func _body(configuration: TextField<Self._Label>) -> some View {
    JuncoInputChrome(content: configuration)
  }
}

public extension TextFieldStyle where Self == JuncoTextFieldStyle {
  static var junco: JuncoTextFieldStyle { JuncoTextFieldStyle() }
}

private struct JuncoInputChrome<Content: View>: View {
  let content: Content

  @FocusState private var focused: Bool
  @Environment(\.juncoFieldInvalid) private var invalid
  @Environment(\.isEnabled) private var isEnabled

  private var shape: RoundedRectangle {
    RoundedRectangle(cornerRadius: JuncoTokens.Radius.card, style: .continuous)
  }

  var body: some View {
    let c = Color.junco
    let stroke = invalid ? c.destructive : focused ? c.ring : c.input
    content
      .focused($focused)
      .font(.junco(JuncoTokens.FontSize.sm))
      .foregroundStyle(c.foreground)
      .padding(.horizontal, JuncoTokens.Spacing.x(3))
      .frame(minHeight: 40)
      .background(shape.fill(c.background))
      .overlay(shape.strokeBorder(stroke, lineWidth: focused || invalid ? 2 : 1))
      .opacity(isEnabled ? 1 : 0.5)
  }
}

/// A label, the control, then help text or an error. Errors come with an icon and are read by
/// VoiceOver, so they never rely on color alone.
///
///     JuncoField("Email", description: "We never share it.", error: emailError) {
///       TextField("you@example.com", text: $email).textFieldStyle(.junco)
///     }
public struct JuncoField<Content: View>: View {
  let label: String
  let description: String?
  let error: String?
  let isRequired: Bool
  let content: Content

  public init(
    _ label: String,
    description: String? = nil,
    error: String? = nil,
    isRequired: Bool = false,
    @ViewBuilder content: () -> Content
  ) {
    self.label = label
    self.description = description
    self.error = error
    self.isRequired = isRequired
    self.content = content()
  }

  private var hint: String {
    [error, description].compactMap { $0 }.joined(separator: ". ")
  }

  public var body: some View {
    let c = Color.junco
    VStack(alignment: .leading, spacing: JuncoTokens.Spacing.x(1.5)) {
      HStack(spacing: 2) {
        Text(label)
          .font(.junco(JuncoTokens.FontSize.sm, weight: .medium))
          .foregroundStyle(c.foreground)
        if isRequired {
          Text("*").foregroundStyle(c.destructiveText).accessibilityHidden(true)
        }
      }
      .accessibilityHidden(true)

      content
        .environment(\.juncoFieldInvalid, error != nil)
        .accessibilityLabel(Text(isRequired ? "\(label), required" : label))
        .accessibilityHint(Text(hint))

      if let error {
        HStack(alignment: .firstTextBaseline, spacing: JuncoTokens.Spacing.x(1)) {
          Image(systemName: "exclamationmark.circle")
          Text(error)
        }
        .font(.junco(JuncoTokens.FontSize.sm))
        .foregroundStyle(c.destructiveText)
        .accessibilityHidden(true)
      } else if let description {
        Text(description)
          .font(.junco(JuncoTokens.FontSize.sm))
          .foregroundStyle(c.mutedForeground)
          .accessibilityHidden(true)
      }
    }
  }
}
#endif
