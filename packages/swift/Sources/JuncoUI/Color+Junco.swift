#if canImport(SwiftUI)
import SwiftUI
@_exported import JuncoTokens
#if os(macOS)
import AppKit
#elseif os(iOS) || os(tvOS) || os(visionOS)
import UIKit
#endif

public extension Color {
  /// A color that follows the system appearance: the token's light value in light mode and its
  /// dark value in dark mode. `.preferredColorScheme(.dark)` flips it like any system color.
  init(junco token: JuncoColorToken) {
    #if os(macOS)
    self.init(nsColor: NSColor(name: NSColor.Name(token.name)) { appearance in
      let isDark = appearance.bestMatch(from: [.aqua, .darkAqua]) == .darkAqua
      let v = token.value(isDark: isDark)
      return NSColor(srgbRed: v.red, green: v.green, blue: v.blue, alpha: v.alpha)
    })
    #elseif os(iOS) || os(tvOS) || os(visionOS)
    self.init(uiColor: UIColor { traits in
      let v = token.value(isDark: traits.userInterfaceStyle == .dark)
      return UIColor(red: v.red, green: v.green, blue: v.blue, alpha: v.alpha)
    })
    #else
    // watchOS has no light mode.
    let v = token.dark
    self.init(.sRGB, red: v.red, green: v.green, blue: v.blue, opacity: v.alpha)
    #endif
  }
}
#endif
