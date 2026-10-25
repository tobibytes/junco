#if canImport(SwiftUI)
import SwiftUI
import JuncoTokens
#if os(macOS)
import AppKit
#elseif canImport(UIKit)
import UIKit
#endif

/// Geist for text, Geist Mono for code and numbers. Both fall back to the system font when the app
/// hasn't bundled them, so nothing breaks before you add the font files.
public enum JuncoFontFamily: Sendable {
  case sans
  case mono

  var postScriptName: String { self == .sans ? "Geist-Regular" : "GeistMono-Regular" }
  var familyName: String { self == .sans ? "Geist" : "Geist Mono" }

  /// True when the font is registered with the app (bundled and listed under UIAppFonts / ATSApplicationFontsPath).
  public var isAvailable: Bool {
    #if os(macOS)
    return NSFont(name: postScriptName, size: 12) != nil
    #elseif canImport(UIKit)
    return UIFont(name: postScriptName, size: 12) != nil
    #else
    return false
    #endif
  }
}

public extension Font {
  /// A Junco font at a type-scale size. It scales with Dynamic Type relative to `textStyle`.
  ///
  ///     Text("Settings").font(.junco(JuncoTokens.FontSize.xl, weight: .semibold))
  static func junco(
    _ size: JuncoFontSize = JuncoTokens.FontSize.base,
    weight: Font.Weight = .regular,
    family: JuncoFontFamily = .sans,
    relativeTo textStyle: Font.TextStyle = .body
  ) -> Font {
    // A missing custom font falls back to the system font at the same size, still scaling with
    // Dynamic Type. Mono without Geist Mono becomes SF Mono.
    let font = Font.custom(family.familyName, size: size.size, relativeTo: textStyle).weight(weight)
    return family == .mono && !family.isAvailable ? font.monospaced() : font
  }
}

public extension View {
  /// Applies a type-scale size with its line height, so text sets like it does on the web.
  func juncoText(
    _ size: JuncoFontSize = JuncoTokens.FontSize.base,
    weight: Font.Weight = .regular,
    family: JuncoFontFamily = .sans
  ) -> some View {
    font(.junco(size, weight: weight, family: family)).lineSpacing(size.lineSpacing)
  }
}
#endif
