#if canImport(SwiftUI)
import SwiftUI
import JuncoTokens

/// How much Junco animates. Mirrors `data-motion` on the web. The system Reduce Motion setting
/// always wins and turns movement off.
public enum JuncoMotionLevel: String, Sendable, CaseIterable {
  case full
  case subtle
  case off

  public var scale: Double {
    switch self {
    case .full: JuncoTokens.MotionScale.full
    case .subtle: JuncoTokens.MotionScale.subtle
    case .off: JuncoTokens.MotionScale.off
    }
  }
}

private struct JuncoMotionKey: EnvironmentKey {
  static let defaultValue: JuncoMotionLevel = .full
}

public extension EnvironmentValues {
  var juncoMotion: JuncoMotionLevel {
    get { self[JuncoMotionKey.self] }
    set { self[JuncoMotionKey.self] = newValue }
  }
}

public enum JuncoMotion {
  /// A token-timed animation, or nil when motion is off or Reduce Motion is on (nil means "no
  /// animation" to `.animation(_:value:)` and `withAnimation`).
  public static func animation(
    duration: Double = JuncoTokens.Duration.base,
    easing: JuncoCubicBezier = JuncoTokens.Easing.standard,
    level: JuncoMotionLevel = .full,
    reduceMotion: Bool = false
  ) -> Animation? {
    let scale = reduceMotion ? 0 : level.scale
    guard scale > 0 else { return nil }
    return .timingCurve(easing.x1, easing.y1, easing.x2, easing.y2, duration: duration * scale)
  }
}

private struct JuncoAnimationModifier<Value: Equatable>: ViewModifier {
  let value: Value
  let duration: Double
  let easing: JuncoCubicBezier
  @Environment(\.juncoMotion) private var level
  @Environment(\.accessibilityReduceMotion) private var reduceMotion

  func body(content: Content) -> some View {
    content.animation(
      JuncoMotion.animation(duration: duration, easing: easing, level: level, reduceMotion: reduceMotion),
      value: value
    )
  }
}

public extension View {
  /// Sets the motion level for everything inside. `.juncoMotion(.off)` stops Junco animations.
  func juncoMotion(_ level: JuncoMotionLevel) -> some View {
    environment(\.juncoMotion, level)
  }

  /// Animates changes to `value` with Junco's timing, respecting the motion level and Reduce Motion.
  func juncoAnimation<Value: Equatable>(
    value: Value,
    duration: Double = JuncoTokens.Duration.base,
    easing: JuncoCubicBezier = JuncoTokens.Easing.standard
  ) -> some View {
    modifier(JuncoAnimationModifier(value: value, duration: duration, easing: easing))
  }
}
#endif
