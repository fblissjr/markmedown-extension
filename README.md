# MarkMeDown

Browser extension that converts webpages to Markdown via right-click menu.

## Install

1. Go to browser extension settings (enable Developer Mode)
2. Load unpacked extension from this folder

## Usage

- **Full page**: Right-click anywhere > "Copy page as Markdown"
- **Selection**: Select text > Right-click > "Copy selection as Markdown"

Output includes page title, source URL, and content.

## Compatibility

- Orion (macOS) - primary target
- Chrome, Chromium-based browsers

## Dependencies

- [Defuddle](https://github.com/kepano/defuddle) - content extraction 
- [Turndown](https://github.com/mixmark-io/turndown) - HTML to Markdown

## Debug

Set `DEBUG = true` in `background.js` line 2 for verbose logging.

## Docs

See `docs/` for architecture, API reference, and troubleshooting.
