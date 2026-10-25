import Foundation

/// Plain value types for Junco's tokens. No UI framework, so this module also builds on Linux and
/// can be used in server-side Swift, widgets, or code generators.

/// A gamma-encoded sRGB color with alpha, each channel 0...1.
public struct JuncoRGBA: Sendable, Hashable {
  public let red: Double
  public let green: Double
  public let blue: Double
  public let alpha: Double

  public init(red: Double, green: Double, blue: Double, alpha: Double = 1) {
    self.red = red
    self.green = green
    self.blue = blue
    self.alpha = alpha
  }

  /// WCAG 2 relative luminance.
  public var luminance: Double {
    func linear(_ c: Double) -> Double { c <= 0.04045 ? c / 12.92 : pow((c + 0.055) / 1.055, 2.4) }
    return 0.2126 * linear(red) + 0.7152 * linear(green) + 0.0722 * linear(blue)
  }

  /// WCAG 2 contrast ratio against another opaque color, 1...21.
  public func contrastRatio(with other: JuncoRGBA) -> Double {
    let (a, b) = (luminance, other.luminance)
    return (max(a, b) + 0.05) / (min(a, b) + 0.05)
  }

  /// `#RRGGBB` (alpha dropped), handy for logs and design tools.
  public var hex: String {
    func byte(_ c: Double) -> String {
      let v = Int((max(0, min(1, c)) * 255).rounded())
      let digits = Array("0123456789ABCDEF")
      return String([digits[v / 16], digits[v % 16]])
    }
    return "#" + byte(red) + byte(green) + byte(blue)
  }
}

/// A semantic color with its light and dark values.
public struct JuncoColorToken: Sendable, Hashable {
  /// The CSS variable name without `--`, e.g. `primary-foreground`.
  public let name: String
  public let light: JuncoRGBA
  public let dark: JuncoRGBA

  public init(name: String, light: JuncoRGBA, dark: JuncoRGBA) {
    self.name = name
    self.light = light
    self.dark = dark
  }

  public func value(isDark: Bool) -> JuncoRGBA { isDark ? dark : light }
}

/// A font size and its line height, in points.
public struct JuncoFontSize: Sendable, Hashable {
  public let size: Double
  public let lineHeight: Double

  public init(size: Double, lineHeight: Double) {
    self.size = size
    self.lineHeight = lineHeight
  }

  /// Extra space to add between lines so text matches the web's line height.
  public var lineSpacing: Double { max(0, lineHeight - size * 1.2) }
}

/// A CSS cubic-bezier easing curve.
public struct JuncoCubicBezier: Sendable, Hashable {
  public let x1: Double
  public let y1: Double
  public let x2: Double
  public let y2: Double

  public init(x1: Double, y1: Double, x2: Double, y2: Double) {
    self.x1 = x1
    self.y1 = y1
    self.x2 = x2
    self.y2 = y2
  }
}

public extension JuncoTokens.Colors {
  /// Looks a color up by its CSS name, e.g. `"muted-foreground"`.
  static func named(_ name: String) -> JuncoColorToken? { all.first { $0.name == name } }
}
