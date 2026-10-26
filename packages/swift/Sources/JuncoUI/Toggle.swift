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

  var body: some View {
    Button {
      configuration.isOn.toggle()
    } label: {
      configuration.label
    }
    .buttonStyle(JuncoSwitchButtonStyle(isOn: configuration.isOn))
    .opacity(isEnabled ? 1 : 0.5)
    .accessibilityRepresentation {
      Toggle(isOn: configuration.$isOn) { configuration.label }
    }
  }
}

/// Draws the label and track. A button style so it can read the button's own focus state.
private struct JuncoSwitchButtonStyle: ButtonStyle {
  let isOn: Bool

  func makeBody(configuration: Configuration) -> some View {
    JuncoSwitchBody(label: configuration.label, isOn: isOn)
  }
}

private struct JuncoSwitchBody<Label: View>: View {
  let label: Label
  let isOn: Bool

  @Environment(\.isFocused) private var isFocused
  @Environment(\.juncoMotion) private var motion
  @Environment(\.accessibilityReduceMotion) private var reduceMotion

  var body: some View {
    if #available(iOS 18, macOS 15, tvOS 18, watchOS 11, visionOS 2, *) {
      LabelsVisibilityReader { switchRow(showsLabel: $0) }
    } else {
      switchRow(showsLabel: true)
    }
  }

  private func switchRow(showsLabel: Bool) -> some View {
    let c = Color.junco
    return HStack(spacing: JuncoTokens.Spacing.x(3)) {
      if showsLabel {
        label
          .font(.junco(JuncoTokens.FontSize.sm))
          .foregroundStyle(c.foreground)
        Spacer(minLength: 0)
      }
      // Same colors as the web `.switch`: border-strong off (3:1 against the page), primary on,
      // and a surface thumb, which clears 3:1 on both tracks in both modes. (A white thumb in dark
      // mode looks more like iOS but drops to 2.6:1 on the lighter dark-mode primary.)
      Capsule()
        .fill(isOn ? c.primary : c.borderStrong)
        .frame(width: 40, height: 24)
        .overlay(alignment: isOn ? .trailing : .leading) {
          Circle()
            .fill(c.surface)
            .padding(2)
        }
        .juncoFocusRing(isFocused, cornerRadius: JuncoTokens.Radius.pill)
    }
    .contentShape(Rectangle())
    .animation(
      JuncoMotion.animation(duration: JuncoTokens.Duration.fast, level: motion, reduceMotion: reduceMotion),
      value: isOn
    )
  }
}

/// Reads `.labelsHidden()`, which custom toggle styles have to honor themselves. Before iOS 18 /
/// macOS 15 the label always shows.
@available(iOS 18, macOS 15, tvOS 18, watchOS 11, visionOS 2, *)
private struct LabelsVisibilityReader<Content: View>: View {
  @Environment(\.labelsVisibility) private var visibility
  let content: (Bool) -> Content

  var body: some View { content(visibility != .hidden) }
}
#endif
