#if canImport(SwiftUI)
import SwiftUI
import XCTest
@testable import JuncoUI

final class JuncoUITests: XCTestCase {
  func testMotionOffAndReduceMotionDisableAnimation() {
    XCTAssertNil(JuncoMotion.animation(level: .off))
    XCTAssertNil(JuncoMotion.animation(level: .full, reduceMotion: true))
    XCTAssertNotNil(JuncoMotion.animation(level: .full))
    XCTAssertNotNil(JuncoMotion.animation(level: .subtle))
  }

  func testMotionScaleMatchesTokens() {
    XCTAssertEqual(JuncoMotionLevel.full.scale, 1)
    XCTAssertEqual(JuncoMotionLevel.subtle.scale, JuncoTokens.MotionScale.subtle)
    XCTAssertEqual(JuncoMotionLevel.off.scale, 0)
  }

  func testButtonSizesMeetTapTargets() {
    // 44pt is Apple's minimum; md and lg meet it with padding, sm is for dense toolbars.
    XCTAssertGreaterThanOrEqual(JuncoButtonStyle.Size.md.height, 40)
    XCTAssertGreaterThanOrEqual(JuncoButtonStyle.Size.lg.height, 44)
  }

  func testStylesBuild() {
    // Building the bodies catches broken view code that only fails at runtime.
    _ = Button("Save") {}.buttonStyle(.junco)
    _ = Button("Delete") {}.buttonStyle(.junco(.destructive, size: .sm, fullWidth: true))
    _ = TextField("Email", text: .constant("")).textFieldStyle(.junco)
    _ = Toggle("On", isOn: .constant(true)).toggleStyle(.junco)
    _ = JuncoField("Email", error: "Required") { TextField("Email", text: .constant("")) }.body
    _ = JuncoBadge("Paid", variant: .success, systemImage: "checkmark").body
    _ = JuncoCard { Text("Hi") }.body
    _ = JuncoTabs(selection: .constant(1), items: [.init("One", value: 1), .init("Two", value: 2, systemImage: "star")]).body
    _ = JuncoListRow("Notifications", subtitle: "Email", systemImage: "bell", value: "On") {}.body
    _ = JuncoListRow("Version", value: "1.0").body
    _ = JuncoListRow("Dark mode") { Toggle("Dark mode", isOn: .constant(true)).labelsHidden() }.body
    _ = JuncoSheetPanel(title: "Edit", description: "Details") { Text("Hi") }.body
    _ = Text("Hi").juncoSheet(isPresented: .constant(false), title: "Edit") { Text("Hi") }
    _ = Text("Hi").juncoFocusRing(true, cornerRadius: JuncoTokens.Radius.card)
  }

  func testSwitchThumbStandsOutFromBothTracks() {
    // Non-text control parts need 3:1. The thumb is `surface` in both modes, like the web.
    let colors = JuncoTokens.Colors.self
    for isDark in [false, true] {
      let thumb = colors.surface.value(isDark: isDark)
      for track in [colors.primary, colors.borderStrong] {
        XCTAssertGreaterThanOrEqual(
          thumb.contrastRatio(with: track.value(isDark: isDark)), JuncoTokens.ContrastPairs.minimumControl,
          "thumb on \(track.name), \(isDark ? "dark" : "light")"
        )
      }
    }
  }

  #if os(macOS)
  func testColorsFollowAppearance() throws {
    func components(_ color: Color, _ name: NSAppearance.Name) throws -> (Double, Double, Double) {
      var rgb = (0.0, 0.0, 0.0)
      let appearance = try XCTUnwrap(NSAppearance(named: name))
      appearance.performAsCurrentDrawingAppearance {
        if let c = NSColor(color).usingColorSpace(.sRGB) {
          rgb = (c.redComponent, c.greenComponent, c.blueComponent)
        }
      }
      return rgb
    }
    let token = JuncoTokens.Colors.background
    let light = try components(Color.junco.background, .aqua)
    let dark = try components(Color.junco.background, .darkAqua)
    XCTAssertEqual(light.0, token.light.red, accuracy: 0.01)
    XCTAssertEqual(dark.0, token.dark.red, accuracy: 0.01)
    XCTAssertNotEqual(light.0, dark.0, accuracy: 0.1)
  }
  #endif
}
#endif
