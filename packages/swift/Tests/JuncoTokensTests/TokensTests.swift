import XCTest
@testable import JuncoTokens

final class TokensTests: XCTestCase {
  private func color(_ name: String) throws -> JuncoColorToken {
    try XCTUnwrap(JuncoTokens.Colors.named(name), "missing color token \(name)")
  }

  /// The same guarantee the web's contrast test makes, checked again on the Swift values, so a
  /// bad conversion from oklch to sRGB can't slip through.
  func testTextPairsMeetContrastInBothModes() throws {
    for (text, background) in JuncoTokens.ContrastPairs.text {
      for isDark in [false, true] {
        let ratio = try color(text).value(isDark: isDark).contrastRatio(with: color(background).value(isDark: isDark))
        XCTAssertGreaterThanOrEqual(ratio, JuncoTokens.ContrastPairs.minimumText, "\(text) on \(background) (\(isDark ? "dark" : "light")) is \(ratio)")
      }
    }
  }

  func testControlPairsMeetContrastInBothModes() throws {
    for (part, background) in JuncoTokens.ContrastPairs.control {
      for isDark in [false, true] {
        let ratio = try color(part).value(isDark: isDark).contrastRatio(with: color(background).value(isDark: isDark))
        XCTAssertGreaterThanOrEqual(ratio, JuncoTokens.ContrastPairs.minimumControl, "\(part) on \(background) (\(isDark ? "dark" : "light")) is \(ratio)")
      }
    }
  }

  func testChannelsAreInRange() {
    for token in JuncoTokens.Colors.all {
      for c in [token.light, token.dark] {
        for v in [c.red, c.green, c.blue, c.alpha] {
          XCTAssert((0...1).contains(v), "\(token.name) has a channel out of range: \(v)")
        }
      }
    }
  }

  func testKnownValues() throws {
    XCTAssertEqual(try color("surface").light.hex, "#FFFFFF")
    XCTAssertEqual(JuncoTokens.Spacing.unit, 4)
    XCTAssertEqual(JuncoTokens.Spacing.x(4), 16)
    XCTAssertEqual(JuncoTokens.Radius.card, 8)
    XCTAssertEqual(JuncoTokens.Radius.control, 6)
    XCTAssertEqual(JuncoTokens.FontSize.sm.size, 14)
    XCTAssertEqual(JuncoTokens.Duration.fast, 0.12, accuracy: 0.0001)
    XCTAssertEqual(JuncoTokens.MotionScale.subtle, 0.6)
    XCTAssertEqual(JuncoTokens.Colors.all.count, Set(JuncoTokens.Colors.all.map(\.name)).count, "duplicate color names")
  }

  func testWCAGMathMatchesReferenceValues() {
    let black = JuncoRGBA(red: 0, green: 0, blue: 0)
    let white = JuncoRGBA(red: 1, green: 1, blue: 1)
    XCTAssertEqual(black.contrastRatio(with: white), 21, accuracy: 0.01)
    let gray = JuncoRGBA(red: 119 / 255, green: 119 / 255, blue: 119 / 255)
    XCTAssertEqual(gray.contrastRatio(with: white), 4.48, accuracy: 0.01)
  }
}
