#if canImport(SwiftUI)
import SwiftUI
import JuncoTokens

/// A system sheet with Junco's surface, a titled header and a labelled close button. Like the web
/// Sheet's bottom placement on phones: it slides up, snaps to `detents`, and drags to dismiss.
/// Presentation follows the system Reduce Motion setting, and `.juncoMotion(.off)` presents it
/// without animation.
///
///     .juncoSheet(isPresented: $editing, title: "Edit profile", description: "Visible to your team.") {
///       JuncoField("Name") { TextField("Name", text: $name).textFieldStyle(.junco) }
///     }
public extension View {
  func juncoSheet<Content: View>(
    isPresented: Binding<Bool>,
    title: String,
    description: String? = nil,
    detents: Set<PresentationDetent> = [.medium, .large],
    onDismiss: (() -> Void)? = nil,
    @ViewBuilder content: @escaping () -> Content
  ) -> some View {
    modifier(JuncoSheetModifier(
      isPresented: isPresented, title: title, description: description, detents: detents,
      onDismiss: onDismiss, sheetContent: content
    ))
  }
}

private struct JuncoSheetModifier<SheetContent: View>: ViewModifier {
  @Binding var isPresented: Bool
  let title: String
  let description: String?
  let detents: Set<PresentationDetent>
  let onDismiss: (() -> Void)?
  let sheetContent: () -> SheetContent

  @Environment(\.juncoMotion) private var motion

  func body(content: Content) -> some View {
    content
      .transaction { if motion == .off { $0.disablesAnimations = true } }
      .sheet(isPresented: $isPresented, onDismiss: onDismiss) {
        JuncoSheetPanel(title: title, description: description) { sheetContent() }
          .presentationDetents(detents)
          .presentationDragIndicator(.visible)
          .presentationBackground(Color.junco.popover)
          .juncoMotion(motion)
      }
  }
}

/// The inside of a Junco sheet: header (title, description, close) and scrolling content. Use it
/// directly when you present the sheet yourself, e.g. with `.sheet(item:)`.
public struct JuncoSheetPanel<Content: View>: View {
  let title: String
  let description: String?
  let content: Content

  @Environment(\.dismiss) private var dismiss

  public init(title: String, description: String? = nil, @ViewBuilder content: () -> Content) {
    self.title = title
    self.description = description
    self.content = content()
  }

  public var body: some View {
    let c = Color.junco
    VStack(alignment: .leading, spacing: 0) {
      HStack(alignment: .top, spacing: JuncoTokens.Spacing.x(3)) {
        VStack(alignment: .leading, spacing: JuncoTokens.Spacing.x(1)) {
          Text(title)
            .juncoText(JuncoTokens.FontSize.lg, weight: .semibold)
            .foregroundStyle(c.popoverForeground)
            .accessibilityAddTraits(.isHeader)
          if let description {
            Text(description)
              .juncoText(JuncoTokens.FontSize.sm)
              .foregroundStyle(c.mutedForeground)
          }
        }
        Spacer(minLength: 0)
        Button {
          dismiss()
        } label: {
          Image(systemName: "xmark")
            .frame(width: 20, height: 20)
        }
        .buttonStyle(.junco(.ghost, size: .sm))
        .accessibilityLabel(Text("Close"))
      }
      .padding(.horizontal, JuncoTokens.Spacing.x(6))
      .padding(.top, JuncoTokens.Spacing.x(6))
      .padding(.bottom, JuncoTokens.Spacing.x(4))

      ScrollView {
        VStack(alignment: .leading, spacing: JuncoTokens.Spacing.x(4)) { content }
          .frame(maxWidth: .infinity, alignment: .leading)
          .padding(.horizontal, JuncoTokens.Spacing.x(6))
          .padding(.bottom, JuncoTokens.Spacing.x(6))
      }
    }
    .foregroundStyle(c.popoverForeground)
    .background(c.popover)
  }
}
#endif
