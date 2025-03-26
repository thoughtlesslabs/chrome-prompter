let popupWindowId = null;

async function createOrFocusPopup() {
  if (popupWindowId) {
    try {
      await chrome.windows.get(popupWindowId);
      return;
    } catch {
      popupWindowId = null;
    }
  }

  try {
    const [currentWindow] = await chrome.windows.getCurrent();
    
    // Create popup window
    const popup = await chrome.windows.create({
      url: 'popup.html', // Simplified URL
      type: 'popup',
      width: 320,
      height: 400,
      focused: false,
      left: currentWindow.left + Math.floor(currentWindow.width * 0.7),
      top: currentWindow.top + 50
    });
    
    popupWindowId = popup.id;

    // Update window to be on top but not focused
    await chrome.windows.update(popupWindowId, {
      focused: false
    });

    // Focus back on the original window
    await chrome.windows.update(currentWindow.id, {
      focused: true
    });
  } catch (error) {
    console.error('Failed to create popup:', error);
  }
}

// Listen for keyboard shortcuts
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'toggle-teleprompter') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      try {
        // First check if the content script is already injected
        let contentScriptLoaded = false;
        try {
          await chrome.tabs.sendMessage(tab.id, { action: 'ping' });
          contentScriptLoaded = true;
        } catch {
          // Content script not injected yet
          contentScriptLoaded = false;
        }
        
        if (!contentScriptLoaded) {
          // Inject the content script
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
          });
        }
        
        // Send the toggle command
        await chrome.tabs.sendMessage(tab.id, { action: 'toggleTeleprompter' });
      } catch (error) {
        console.error('Failed to execute script or send message:', error);
      }
    }
  } else if (command === 'increase-speed' || command === 'decrease-speed') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      try {
        await chrome.tabs.sendMessage(tab.id, { action: command });
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }
  }
});

// Clean up popupWindowId when window is closed
chrome.windows.onRemoved.addListener((windowId) => {
  if (windowId === popupWindowId) {
    popupWindowId = null;
  }
}); 