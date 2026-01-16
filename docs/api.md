# API Reference

## Libraries

### Defuddle
```javascript
const defuddle = new Defuddle(document, { url: document.URL });
const result = defuddle.parse();
// result.content - cleaned HTML string
// result.title, result.author, result.description, etc.
```

### TurndownService
```javascript
const turndown = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
  emDelimiter: "_"
});

turndown.remove(["script", "style"]);
turndown.keep(["iframe", "video"]);
turndown.addRule("name", { filter: "tag", replacement: fn });

const markdown = turndown.turndown(html);
```

## Chrome APIs Used

- `chrome.contextMenus.create()` - Create menu items
- `chrome.contextMenus.removeAll()` - Clear menus
- `chrome.contextMenus.onClicked` - Handle clicks
- `chrome.scripting.executeScript()` - Inject scripts
- `chrome.action.setBadgeText()` - Show badge
- `chrome.action.setBadgeBackgroundColor()` - Badge color
