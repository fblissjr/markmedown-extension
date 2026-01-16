# Architecture

## Overview

MarkMeDown is a Manifest V3 browser extension that converts webpage content to Markdown via right-click context menu.

## File Structure

```
markmedown-extension/
├── manifest.json       # Extension manifest (v3)
├── background.js       # Service worker (all logic)
├── lib/
│   ├── defuddle.js     # Content extraction (102KB)
│   └── turndown.js     # HTML-to-Markdown (27KB)
└── icons/              # 16/48/128px icons
```

## Data Flow

```
User right-clicks
       │
       ▼
┌─────────────────────────────────────┐
│  background.js (Service Worker)     │
│  contextMenus.onClicked handler     │
└─────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  chrome.scripting.executeScript     │
│  Inject: turndown.js + defuddle.js  │
└─────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Page Context (ISOLATED world)      │
│  ┌───────────────────────────────┐  │
│  │ Selection mode:               │  │
│  │   getSelection().cloneContents│  │
│  │                               │  │
│  │ Full page mode:               │  │
│  │   Defuddle(document).parse()  │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ TurndownService.turndown(html)│  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ Add header (title + URL)      │  │
│  │ Copy via execCommand          │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
       │
       ▼
    Clipboard
```

## Key Design Decisions

### 1. ISOLATED World (Not MAIN)

Orion browser doesn't support `world: "MAIN"` in `chrome.scripting.executeScript`. Using default ISOLATED world works across all browsers.

### 2. execCommand for Clipboard

`navigator.clipboard.writeText()` can fail in injected scripts. The textarea + `execCommand("copy")` method is more reliable.

### 3. Context Menu Recreation

Menus created at service worker startup (not just `onInstalled`) to survive worker restarts:

```javascript
chrome.contextMenus.removeAll(() => {
  chrome.contextMenus.create({ ... });
});
```

### 4. On-Demand Injection

Libraries only load when user invokes menu - no persistent content scripts.

## Output Format

```markdown
# Page Title

Source: https://example.com/page

---

[converted content]
```

## Permissions

| Permission | Purpose |
|------------|---------|
| `contextMenus` | Create right-click menu items |
| `activeTab` | Access current tab on user gesture |
| `scripting` | Inject scripts into page |
| `clipboardWrite` | Write to clipboard |
