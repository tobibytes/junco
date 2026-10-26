#if canImport(SwiftUI)
import SwiftUI
import JuncoTokens

public extension View {
  /// The web's `:focus-visible` ring: 2pt of `--ring`, 2pt outside the control. Custom button and
  /// toggle styles lose the system focus indicator, so Junco styles draw this instead. It shows for
  /// keyboard focus (iPad keyboards, Full Keyboard Access, macOS, tvOS).
  ///
  ///     content.juncoFocusRing(isFocused, cornerRadius: JuncoTokens.Radius.card)
  func juncoFocusRing(_ isFocused: Bool, cornerRadius: Double) -> some View {
    overlay {
      if isFocused {
        RoundedRectangle(cornerRadius: cornerRadius + 4, style: .continuous)
          .strokeBorder(Color.junco.ring, lineWidth: 2)
          .padding(-4)
          .accessibilityHidden(true)
      }
    }
  }
}
#endif
