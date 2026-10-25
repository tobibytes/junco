# @junco/three (phase 3)

Planned stack: React Three Fiber + drei, lazy loaded with `React.lazy` so apps without 3D pay nothing.

First scenes: particle field, shader gradient background, data globe, tilt card, model viewer.

Rules:
- Colors come from Junco CSS variables (read at runtime), so switching to dark mode relights the scene
- Pause rendering when off screen (IntersectionObserver + `frameloop="demand"`)
- Without WebGL, in low-power mode, or with reduced motion: show a still image or a single frame
