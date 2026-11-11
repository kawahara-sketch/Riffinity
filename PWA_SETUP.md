# Riffinity PWA

1. Merge this PR and wait for GitHub Pages deployment.
2. Open https://kawahara-sketch.github.io/Riffinity/ in Safari on iPhone.
3. Tap Share → Add to Home Screen → Add, then launch Riffinity from its icon.
4. Launch once online to cache the shell; after that, previously cached pages can load offline.

## Limitations
- Data remains in localStorage on the device and is not synchronized across Safari and standalone PWA storage. Export a JSON backup before switching.
- Web Audio playback and iOS background execution remain subject to browser restrictions.
- The SVG icon may not be used by all iOS versions as a home-screen icon. A PNG Apple touch icon can be added later.
- Notifications while the app is closed require a push subscription and server-side push delivery.
