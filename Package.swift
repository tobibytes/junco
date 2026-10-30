// swift-tools-version: 5.9
// Junco for Swift. Lives at the repo root so apps can add it straight from GitHub:
//   .package(url: "https://github.com/tobibytes/junco", .upToNextMinor(from: "0.1.0"))
// Versions are plain git tags (0.1.0, 0.1.1, ...); see docs/releasing.md.
// Sources are in packages/swift/. JuncoTokens is generated from packages/tokens/src/tokens.css.
import PackageDescription

let package = Package(
  name: "Junco",
  platforms: [.iOS(.v17), .macOS(.v14), .tvOS(.v17), .watchOS(.v10), .visionOS(.v1)],
  products: [
    .library(name: "JuncoTokens", targets: ["JuncoTokens"]),
    .library(name: "JuncoUI", targets: ["JuncoUI"]),
  ],
  targets: [
    .target(name: "JuncoTokens", path: "packages/swift/Sources/JuncoTokens"),
    .target(name: "JuncoUI", dependencies: ["JuncoTokens"], path: "packages/swift/Sources/JuncoUI"),
    .testTarget(name: "JuncoTokensTests", dependencies: ["JuncoTokens"], path: "packages/swift/Tests/JuncoTokensTests"),
    .testTarget(name: "JuncoUITests", dependencies: ["JuncoUI"], path: "packages/swift/Tests/JuncoUITests"),
  ]
)
