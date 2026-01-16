# Agent Guide: MarkMeDown Extension

## Project Overview

Chrome/Orion browser extension (Manifest V3) that converts webpage content to Markdown via right-click context menu.

## File Structure

```
markmedown-extension/
├── manifest.json       # Extension manifest (v3)
├── background.js       # Service worker - all logic here
├── content.js          # UNUSED (legacy)
├── lib/
│   ├── defuddle.js     # Content extraction (102KB)
│   └── turndown.js     # HTML-to-Markdown (27KB)
├── icons/              # Extension icons (16/48/128px)
├── docs/               # Additional documentation
└── coderef/            # Reference repos (not part of extension)
```

## Key Architecture Decisions

### Orion Compatibility
- **DO NOT use `world: "MAIN"`** in `chrome.scripting.executeScript`
- Orion browser returns `null` for MAIN world injections
- Use default ISOLATED world instead

### Script Injection
- Libraries injected on-demand (not declared in manifest)
- Single injection call for both libraries: `files: ["lib/turndown.js", "lib/defuddle.js"]`
- Conversion function passed inline via `func` parameter

### Clipboard
- Use `execCommand("copy")` with textarea, NOT `navigator.clipboard`
- More compatible across browser contexts
- Textarea must be appended to DOM, focused, and selected before copy

### Context Menus
- Created at top level with `removeAll()` first
- Handles service worker restarts (not just `onInstalled`)

## Core Flow

1. User right-clicks > selects menu item
2. `background.js` receives click via `contextMenus.onClicked`
3. Injects `turndown.js` + `defuddle.js` into tab
4. Executes inline conversion function in same tab
5. **Selection mode**: Clones selection HTML directly
6. **Full page mode**: Defuddle extracts clean content, removes nav/ads/junk
7. Turndown converts HTML to Markdown
8. Adds header (title + source URL)
9. Copies via textarea/execCommand
10. Shows badge feedback (green OK / red !)

## Libraries

### Defuddle
- Extracts main article content from pages
- Removes navigation, sidebars, ads, CSS
- Usage: `new Defuddle(document, { url: document.URL }).parse().content`
- Returns object with `content`, `title`, `author`, etc.

### Turndown
- Converts HTML to Markdown
- Config: ATX headings, fenced code, `-` bullets
- Usage: `new TurndownService(options).turndown(html)`

## Debug Mode

Set `const DEBUG = true` in `background.js` line 2.

Logs to page console:
- Selection range count and HTML length
- Defuddle content length
- Final markdown length

## Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| Injection returns null | Using `world: "MAIN"` | Remove world parameter |
| Clipboard doesn't work | Using `navigator.clipboard` | Use execCommand method |
| Context menu missing | Service worker restarted | Uses `removeAll()` pattern |
| Junk in output | Defuddle not loaded | Check lib/defuddle.js exists |

## Testing

1. Load unpacked extension in browser
2. Navigate to content-rich page (blog, docs)
3. Right-click > "Copy page as Markdown"
4. Paste and verify clean output with title/URL header
5. Select text > right-click > "Copy selection as Markdown"
6. Paste and verify selection preserved

## Modifying

### To change Markdown format
Edit Turndown config in `background.js` (~line 65):
```javascript
const turndown = new TurndownService({
  headingStyle: "atx",      // or "setext"
  codeBlockStyle: "fenced", // or "indented"
  bulletListMarker: "-",    // or "*" or "+"
  emDelimiter: "_"          // or "*"
});
```

### To change output header
Edit header template in `background.js` (~line 80):
```javascript
const header = `# ${title}\n\nSource: ${url}\n\n---\n\n`;
```

### To add Turndown rules
After turndown instantiation:
```javascript
turndown.addRule('ruleName', {
  filter: 'tagName',
  replacement: (content) => `formatted ${content}`
});
```

## Reference Code
- `defuddle/` - Content extraction library source
- `turndown/` - HTML-to-Markdown library source
- `DOMPurify/` - HTML sanitization (not currently used)

These are NOT part of the extension - just for reference when extending functionality.

## Permissions

```json
"permissions": ["contextMenus", "activeTab", "scripting", "clipboardWrite"]
```

- `contextMenus` - Create right-click menu
- `activeTab` - Access current tab on user gesture
- `scripting` - Inject scripts into page
- `clipboardWrite` - Write to clipboard
