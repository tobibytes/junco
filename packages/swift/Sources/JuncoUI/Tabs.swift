#if canImport(SwiftUI)
import SwiftUI
import JuncoTokens

/// Segmented tabs: a small view switcher, like the web `<Tabs variant="segmented">`. The selected
/// tab gets a raised surface and a border, so it reads without color, and VoiceOver hears
/// "Selected". The indicator slides with Junco's timing and stays still with Reduce Motion.
///
///     JuncoTabs(selection: $range, items: [
///       .init("Day", value: Range.day),
///       .init("Week", value: Range.week),
///       .init("Month", value: Range.month, systemImage: "calendar"),
///     ])
public struct JuncoTabs<Value: Hashable>: View {
  public struct Item: Identifiable {
    public let title: String
    public let value: Value
    public let systemImage: String?
    public var id: Value { value }

    public init(_ title: String, value: Value, systemImage: String? = nil) {
      self.title = title
      self.value = value
      self.systemImage = systemImage
    }
  }

  @Binding var selection: Value
  let items: [Item]
  let fullWidth: Bool

  @Namespace private var indicator
  @Environment(\.isEnabled) private var isEnabled

  public init(selection: Binding<Value>, items: [Item], fullWidth: Bool = false) {
    _selection = selection
    self.items = items
    self.fullWidth = fullWidth
  }

  public var body: some View {
    let c = Color.junco
    let outer = RoundedRectangle(cornerRadius: JuncoTokens.Radius.control, style: .continuous)
    HStack(spacing: 2) {
      ForEach(items) { item in
        Button {
          selection = item.value
        } label: {
          HStack(spacing: JuncoTokens.Spacing.x(1.5)) {
            if let systemImage = item.systemImage {
              Image(systemName: systemImage).imageScale(.small)
            }
            Text(item.title)
          }
        }
        .buttonStyle(JuncoTabButtonStyle(isSelected: item.value == selection, fullWidth: fullWidth, indicator: indicator))
        .accessibilityAddTraits(item.value == selection ? .isSelected : [])
      }
    }
    .padding(2)
    .background(outer.fill(c.muted))
    .overlay(outer.strokeBorder(c.border, lineWidth: 1))
    .opacity(isEnabled ? 1 : 0.5)
    .juncoAnimation(value: selection, duration: JuncoTokens.Duration.fast)
    .accessibilityElement(children: .contain)
  }
}

private struct JuncoTabButtonStyle: ButtonStyle {
  let isSelected: Bool
  let fullWidth: Bool
  let indicator: Namespace.ID

  func makeBody(configuration: Configuration) -> some View {
    JuncoTabBody(label: configuration.label, isSelected: isSelected, fullWidth: fullWidth, indicator: indicator)
  }
}

private struct JuncoTabBody<Label: View>: View {
  let label: Label
  let isSelected: Bool
  let fullWidth: Bool
  let indicator: Namespace.ID

  @Environment(\.isFocused) private var isFocused

  var body: some View {
    let c = Color.junco
    let shape = RoundedRectangle(cornerRadius: JuncoTokens.Radius.xs, style: .continuous)
    label
      .font(.junco(JuncoTokens.FontSize.sm, weight: .medium))
      .lineLimit(1)
      .foregroundStyle(isSelected ? c.foreground : c.mutedForeground)
      .padding(.horizontal, JuncoTokens.Spacing.x(2.5))
      .frame(maxWidth: fullWidth ? .infinity : nil, minHeight: 32)
      .background {
        if isSelected {
          shape
            .fill(c.surface)
            .overlay(shape.strokeBorder(c.border, lineWidth: 1))
            .matchedGeometryEffect(id: "selected", in: indicator)
        }
      }
      .contentShape(shape)
      .juncoFocusRing(isFocused, cornerRadius: JuncoTokens.Radius.xs)
  }
}
#endif
