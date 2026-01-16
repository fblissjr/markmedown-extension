// Debug flag - set to true for verbose logging
const DEBUG = false;

// Create context menus on every service worker start
chrome.contextMenus.removeAll(() => {
  chrome.contextMenus.create({
    id: "copy-page-markdown",
    title: "Copy page as Markdown",
    contexts: ["page", "frame"]
  });

  chrome.contextMenus.create({
    id: "copy-selection-markdown",
    title: "Copy selection as Markdown",
    contexts: ["selection"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const isSelection = info.menuItemId === "copy-selection-markdown";

  try {
    // Inject libraries (ISOLATED world - Orion doesn't support MAIN)
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["lib/turndown.js", "lib/defuddle.js"]
    });

    // Run conversion
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (selectionMode, debug) => {
        try {
          let html;

          if (selectionMode) {
            const selection = window.getSelection();
            if (!selection.rangeCount || selection.isCollapsed) {
              return { success: false, error: "No text selected" };
            }

            // Get all ranges (selection might span multiple)
            const container = document.createElement("div");
            for (let i = 0; i < selection.rangeCount; i++) {
              container.appendChild(selection.getRangeAt(i).cloneContents());
            }
            html = container.innerHTML;

            if (debug) {
              console.log("[MarkMeDown] Selection rangeCount:", selection.rangeCount);
              console.log("[MarkMeDown] Selection HTML length:", html.length);
            }
          } else {
            // Use Defuddle for clean content extraction
            const defuddle = new Defuddle(document, { url: document.URL });
            const result = defuddle.parse();
            html = result.content;

            if (debug) {
              console.log("[MarkMeDown] Defuddle content length:", html.length);
            }
          }

          const turndown = new TurndownService({
            headingStyle: "atx",
            codeBlockStyle: "fenced",
            bulletListMarker: "-",
            emDelimiter: "_"
          });

          turndown.remove(["script", "style", "button"]);
          turndown.keep(["iframe", "video", "audio"]);

          let markdown = turndown.turndown(html);

          // Add source header
          const title = document.title || "Untitled";
          const url = document.URL;
          const header = `# ${title}\n\nSource: ${url}\n\n---\n\n`;
          markdown = header + markdown;

          if (debug) {
            console.log("[MarkMeDown] Final markdown length:", markdown.length);
          }

          // Copy to clipboard using execCommand (most compatible)
          const textarea = document.createElement("textarea");
          textarea.value = markdown;
          textarea.style.position = "fixed";
          textarea.style.top = "0";
          textarea.style.left = "0";
          textarea.style.width = "1px";
          textarea.style.height = "1px";
          textarea.style.opacity = "0";
          document.body.appendChild(textarea);
          textarea.focus();
          textarea.select();
          document.execCommand("copy");
          document.body.removeChild(textarea);

          return { success: true, length: markdown.length };
        } catch (e) {
          console.error("[MarkMeDown] Error:", e);
          return { success: false, error: e.message };
        }
      },
      args: [isSelection, DEBUG]
    });

    const result = results?.[0]?.result;

    if (result?.success) {
      showBadge("OK", "#4CAF50");
    } else {
      showBadge("!", "#F44336");
      console.error("[MarkMeDown]", result?.error || "Conversion failed");
    }
  } catch (error) {
    showBadge("!", "#F44336");
    console.error("[MarkMeDown]", error.message);
  }
});

function showBadge(text, color) {
  chrome.action.setBadgeText({ text });
  chrome.action.setBadgeBackgroundColor({ color });
  setTimeout(() => {
    chrome.action.setBadgeText({ text: "" });
  }, 2000);
}
