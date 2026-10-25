#if canImport(SwiftUI)
import SwiftUI
import JuncoTokens

/// Junco's switch. The thumb's position shows the state, so it never relies on color alone, and
/// VoiceOver sees a standard toggle.
///
///     Toggle("Email alerts", isOn: $alerts).toggleStyle(.junco)
public struct JuncoToggleStyle: ToggleStyle {
  public init() {}

  public func makeBody(configuration: Configuration) -> some View {
    JuncoSwitch(configuration: configuration)
  }
}

public extension ToggleStyle where Self == JuncoToggleStyle {
  static var junco: JuncoToggleStyle { JuncoToggleStyle() }
}

private struct JuncoSwitch: View {
  let configuration: ToggleStyleConfiguration

  @Environment(\.isEnabled) private var isEnabled
  @Environment(\.juncoMotion) private var motion
  @Environment(\.accessibilityReduceMotion) private var reduceMotion

  var body: some View {
    let c = Color.junco
    let isOn = configuration.isOn
    Button {
      configuration.isOn.toggle()
    } label: {
      HStack(spacing: JuncoTokens.Spacing.x(3)) {
        configuration.label
          .font(.junco(JuncoTokens.FontSize.sm))
          .foregroundStyle(c.foreground)
        Spacer(minLength: 0)
        Capsule()
          .fill(isOn ? c.primary : c.input)
          .frame(width: 40, height: 24)
          .overlay(alignment: isOn ? .trailing : .leading) {
            Circle()
              .fill(c.background)
              .padding(3)
          }
      }
      .contentShape(Rectangle())
    }
    .buttonStyle(.plain)
    .opacity(isEnabled ? 1 : 0.5)
    .animation(
      JuncoMotion.animation(duration: JuncoTokens.Duration.fast, level: motion, reduceMotion: reduceMotion),
      value: isOn
    )
    .accessibilityRepresentation {
      Toggle(isOn: configuration.$isOn) { configuration.label }
    }
  }
}
#endif
