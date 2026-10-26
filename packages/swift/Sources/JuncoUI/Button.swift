#if canImport(SwiftUI)
import SwiftUI
import JuncoTokens

/// Junco's button, as a SwiftUI button style.
///
///     Button("Save") { save() }.buttonStyle(.junco)
///     Button("Delete", role: .destructive) { delete() }.buttonStyle(.junco(.destructive, size: .sm))
public struct JuncoButtonStyle: ButtonStyle {
  public enum Variant: Sendable, CaseIterable {
    /// The primary action. One per view.
    case solid
    case outline
    case soft
    case ghost
    case destructive
  }

  public enum Size: Sendable, CaseIterable {
    case sm, md, lg

    var height: Double {
      switch self {
      case .sm: 32
      case .md: 40
      case .lg: 48
      }
    }

    var paddingX: Double {
      switch self {
      case .sm: JuncoTokens.Spacing.x(3)
      case .md: JuncoTokens.Spacing.x(4)
      case .lg: JuncoTokens.Spacing.x(5)
      }
    }

    var font: JuncoFontSize {
      self == .lg ? JuncoTokens.FontSize.base : JuncoTokens.FontSize.sm
    }
  }

  public var variant: Variant
  public var size: Size
  public var fullWidth: Bool

  public init(_ variant: Variant = .solid, size: Size = .md, fullWidth: Bool = false) {
    self.variant = variant
    self.size = size
    self.fullWidth = fullWidth
  }

  public func makeBody(configuration: Configuration) -> some View {
    JuncoButtonBody(configuration: configuration, variant: variant, size: size, fullWidth: fullWidth)
  }
}

public extension ButtonStyle where Self == JuncoButtonStyle {
  static var junco: JuncoButtonStyle { JuncoButtonStyle() }

  static func junco(_ variant: JuncoButtonStyle.Variant, size: JuncoButtonStyle.Size = .md, fullWidth: Bool = false) -> JuncoButtonStyle {
    JuncoButtonStyle(variant, size: size, fullWidth: fullWidth)
  }
}

private struct JuncoButtonBody: View {
  let configuration: ButtonStyleConfiguration
  let variant: JuncoButtonStyle.Variant
  let size: JuncoButtonStyle.Size
  let fullWidth: Bool

  @Environment(\.isEnabled) private var isEnabled
  @Environment(\.isFocused) private var isFocused
  @Environment(\.juncoMotion) private var motion
  @Environment(\.accessibilityReduceMotion) private var reduceMotion

  private var pressed: Bool { configuration.isPressed }
  private var shape: RoundedRectangle {
    RoundedRectangle(cornerRadius: size == .sm ? JuncoTokens.Radius.control : JuncoTokens.Radius.card, style: .continuous)
  }

  private var colors: (fill: Color, text: Color, border: Color) {
    let c = Color.junco
    switch variant {
    case .solid: return (pressed ? c.primary.opacity(0.88) : c.primary, c.primaryForeground, .clear)
    case .outline: return (pressed ? c.accent : c.background, c.foreground, c.border)
    case .soft: return (pressed ? c.accent : c.secondary, c.secondaryForeground, .clear)
    case .ghost: return (pressed ? c.accent : .clear, c.foreground, .clear)
    case .destructive: return (pressed ? c.destructive.opacity(0.88) : c.destructive, c.destructiveForeground, .clear)
    }
  }

  var body: some View {
    let colors = colors
    configuration.label
      .font(.junco(size.font, weight: .medium))
      .lineLimit(1)
      .padding(.horizontal, size.paddingX)
      .frame(maxWidth: fullWidth ? .infinity : nil, minHeight: size.height)
      .foregroundStyle(colors.text)
      .background(shape.fill(colors.fill))
      .overlay(shape.strokeBorder(colors.border, lineWidth: 1))
      .contentShape(shape)
      .opacity(isEnabled ? 1 : 0.5)
      .juncoFocusRing(isFocused, cornerRadius: size == .sm ? JuncoTokens.Radius.control : JuncoTokens.Radius.card)
      .scaleEffect(pressed && motion != .off && !reduceMotion ? 0.98 : 1)
      .animation(
        JuncoMotion.animation(duration: JuncoTokens.Duration.fast, level: motion, reduceMotion: reduceMotion),
        value: pressed
      )
  }
}
#endif
