# Troubleshooting

## Debug Mode

Set `const DEBUG = true` in `background.js` line 2, then check page console for `[MarkMeDown]` logs.

## Common Issues

### Extension doesn't appear in context menu

1. Reload extension in browser settings
2. Check extension is enabled
3. Verify no errors in extension settings page

### Red "!" badge / Nothing copied

**Check service worker console** (extension settings > "Service Worker" link):

| Error | Cause | Fix |
|-------|-------|-----|
| `null is not an object (evaluating 'results[0]')` | Script injection failed | Remove `world: "MAIN"` if present |
| `Conversion failed` | Defuddle/Turndown error | Check lib files exist |
| Tab URL shows `chrome://` | Restricted page | Use on regular websites |

### Clipboard not working

The extension uses `execCommand("copy")` which requires:
- Textarea appended to DOM
- Textarea focused and selected
- User gesture (context menu click provides this)

If still failing, check page's Content Security Policy.

### Junk in output (nav, ads, CSS)

- Verify `lib/defuddle.js` exists and is ~102KB
- Use selection mode for problematic pages
- Some heavily JS-rendered sites may not work well

### Selection cuts off

- Check console for HTML length vs text length
- Multiple selection ranges are now supported
- Very complex DOM structures may have issues

## Checking Logs

### Service Worker Console
Extension settings > Find MarkMeDown > Click "Service Worker" link

Shows:
- Menu click events
- Injection results
- Errors

### Page Console
Right-click page > Inspect > Console

Shows (when DEBUG=true):
- Selection range count
- HTML/content lengths
- Final markdown length

## Known Limitations

- Cannot run on `chrome://`, `chrome-extension://`, or browser settings pages
- No iframe content extraction
- Math/LaTeX not converted (kept as-is or removed)
- Complex tables may not convert perfectly
- `world: "MAIN"` not supported in Orion browser
