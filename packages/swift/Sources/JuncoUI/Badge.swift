#if canImport(SwiftUI)
import SwiftUI
import JuncoTokens

/// A small status label. Pass `systemImage` for status badges so the meaning isn't color alone.
///
///     JuncoBadge("Paid", variant: .success, systemImage: "checkmark")
public struct JuncoBadge: View {
  public enum Variant: Sendable, CaseIterable {
    case neutral, primary, outline, success, warning, destructive
  }

  let text: String
  let variant: Variant
  let systemImage: String?

  public init(_ text: String, variant: Variant = .neutral, systemImage: String? = nil) {
    self.text = text
    self.variant = variant
    self.systemImage = systemImage
  }

  private var colors: (fill: Color, text: Color, border: Color) {
    let c = Color.junco
    switch variant {
    case .neutral: return (c.secondary, c.secondaryForeground, .clear)
    case .primary: return (c.primary, c.primaryForeground, .clear)
    case .outline: return (.clear, c.foreground, c.border)
    case .success: return (c.success, c.successForeground, .clear)
    case .warning: return (c.warning, c.warningForeground, .clear)
    case .destructive: return (c.destructive, c.destructiveForeground, .clear)
    }
  }

  public var body: some View {
    let colors = colors
    HStack(spacing: JuncoTokens.Spacing.x(1)) {
      if let systemImage {
        Image(systemName: systemImage).imageScale(.small)
      }
      Text(text)
    }
    .font(.junco(JuncoTokens.FontSize.xs, weight: .medium, relativeTo: .caption))
    .lineLimit(1)
    .padding(.horizontal, JuncoTokens.Spacing.x(2))
    .padding(.vertical, JuncoTokens.Spacing.x(0.5))
    .foregroundStyle(colors.text)
    .background(Capsule().fill(colors.fill))
    .overlay(Capsule().strokeBorder(colors.border, lineWidth: 1))
    .accessibilityElement(children: .combine)
  }
}
#endif
