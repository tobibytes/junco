#if canImport(SwiftUI)
import SwiftUI
import JuncoTokens

/// A bordered surface. Depth comes from the border, not a shadow, like the web card.
///
///     JuncoCard {
///       Text("Revenue").juncoText(JuncoTokens.FontSize.sm).foregroundStyle(Color.junco.mutedForeground)
///       Text("$12,400").juncoText(JuncoTokens.FontSize.xl2, weight: .semibold)
///     }
public struct JuncoCard<Content: View>: View {
  let padding: Double
  let spacing: Double
  let content: Content

  public init(
    padding: Double = JuncoTokens.Spacing.x(4),
    spacing: Double = JuncoTokens.Spacing.x(2),
    @ViewBuilder content: () -> Content
  ) {
    self.padding = padding
    self.spacing = spacing
    self.content = content()
  }

  public var body: some View {
    VStack(alignment: .leading, spacing: spacing) { content }
      .padding(padding)
      .frame(maxWidth: .infinity, alignment: .leading)
      .juncoCard()
  }
}

public extension View {
  /// Gives any view the card background, border and radius.
  func juncoCard() -> some View {
    let shape = RoundedRectangle(cornerRadius: JuncoTokens.Radius.card, style: .continuous)
    return foregroundStyle(Color.junco.cardForeground)
      .background(shape.fill(Color.junco.card))
      .overlay(shape.strokeBorder(Color.junco.border, lineWidth: 1))
  }
}
#endif
