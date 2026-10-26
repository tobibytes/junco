#if canImport(UIKit) && DEBUG
import SwiftUI
import UIKit
import XCTest
@testable import JuncoUI

/// Renders the preview galleries to PNGs in light and dark, for checking changes outside Xcode.
/// Skipped unless JUNCO_SNAPSHOT_DIR is set:
///   TEST_RUNNER_JUNCO_SNAPSHOT_DIR=/tmp/shots xcodebuild test -scheme Junco-Package \
///     -destination 'platform=iOS Simulator,name=iPhone 17 Pro' -only-testing:JuncoUITests/GallerySnapshotTests
final class GallerySnapshotTests: XCTestCase {
  @MainActor
  func testRenderGalleries() throws {
    guard let dir = ProcessInfo.processInfo.environment["JUNCO_SNAPSHOT_DIR"] else {
      throw XCTSkip("Set JUNCO_SNAPSHOT_DIR to render the galleries")
    }
    let views: [(name: String, view: AnyView, height: Double)] = [
      ("gallery", AnyView(JuncoGallery()), 1500),
      ("sheet", AnyView(JuncoSheetGallery()), 420),
    ]
    for item in views {
      for (mode, style) in [("light", UIUserInterfaceStyle.light), ("dark", .dark)] {
        let size = CGSize(width: 393, height: item.height)
        let window = UIWindow(frame: CGRect(origin: .zero, size: size))
        window.overrideUserInterfaceStyle = style
        let host = UIHostingController(rootView: item.view)
        window.rootViewController = host
        window.makeKeyAndVisible()
        host.view.frame = window.bounds
        host.view.layoutIfNeeded()
        RunLoop.main.run(until: Date().addingTimeInterval(0.5))
        // Package tests have no host app, so drawHierarchy draws nothing; render the layers instead.
        let image = UIGraphicsImageRenderer(size: size).image { ctx in
          host.view.layer.render(in: ctx.cgContext)
        }
        let url = URL(fileURLWithPath: dir).appendingPathComponent("\(item.name)-\(mode).png")
        try XCTUnwrap(image.pngData()).write(to: url)
      }
    }
  }
}
#endif
