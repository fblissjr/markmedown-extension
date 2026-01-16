# Changelog

## 1.0.0

### Features
- Right-click context menu: "Copy page as Markdown" and "Copy selection as Markdown"
- Smart content extraction using Defuddle (removes nav, ads, sidebars)
- HTML to Markdown conversion using Turndown
- Output includes page title and source URL header
- Visual feedback via extension badge (green OK / red !)
- Debug mode flag for troubleshooting

### Technical
- Manifest V3 Chrome extension
- Orion browser compatible (ISOLATED world, no MAIN world)
- On-demand script injection (libraries load only when used)
- execCommand clipboard method for broad compatibility
- Context menu recreation on service worker restart
