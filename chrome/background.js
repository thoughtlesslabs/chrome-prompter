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
    try {
      // Get the active tab in the current window
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tabs || tabs.length === 0 || !tabs[0].id) {
        console.log('No active tab found');
        return;
      }
      
      const tab = tabs[0];
      
      // Check if tab is still valid
      try {
        await chrome.tabs.get(tab.id);
      } catch (error) {
        console.log('Tab no longer exists:', error);
        return;
      }
      
      // Verify tab is in a state where we can inject scripts
      if (tab.status !== 'complete' || !tab.url || tab.url.startsWith('chrome://')) {
        console.log('Tab not ready for content script injection');
        return;
      }
      
      // First check if the content script is already injected
      let contentScriptLoaded = false;
      try {
        contentScriptLoaded = await new Promise((resolve) => {
          const timeout = setTimeout(() => {
            resolve(false);
          }, 300); // Increased timeout for better reliability
          
          chrome.tabs.sendMessage(tab.id, { action: 'ping' }, (response) => {
            clearTimeout(timeout);
            if (chrome.runtime.lastError) {
              console.log('Ping error (expected if content script not loaded):', chrome.runtime.lastError.message);
              resolve(false);
              return;
            }
            resolve(response && response.success === true);
          });
        });
      } catch (error) {
        console.log('Error checking content script:', error);
        contentScriptLoaded = false;
      }
      
      if (!contentScriptLoaded) {
        try {
          // Inject the content script
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
          });
          
          // Give the content script a moment to initialize
          await new Promise(resolve => setTimeout(resolve, 50));
        } catch (error) {
          console.error('Failed to inject content script:', error);
          return;
        }
      }
      
      // Send the toggle command
      chrome.tabs.sendMessage(tab.id, { action: 'toggleTeleprompter' }, (response) => {
        if (chrome.runtime.lastError) {
          console.log('Error toggling teleprompter:', chrome.runtime.lastError.message);
          return;
        }
      });
    } catch (error) {
      console.error('Error in toggle-teleprompter command:', error);
    }
  } else if (command === 'increase-speed' || command === 'decrease-speed') {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tabs || tabs.length === 0 || !tabs[0].id) {
        console.log('No active tab found');
        return;
      }
      
      const tab = tabs[0];
      
      // Check if tab is still valid
      try {
        await chrome.tabs.get(tab.id);
      } catch (error) {
        console.log('Tab no longer exists:', error);
        return;
      }
      
      chrome.tabs.sendMessage(tab.id, { action: command }, (response) => {
        if (chrome.runtime.lastError) {
          console.log(`Error changing speed (${command}):`, chrome.runtime.lastError.message);
          return;
        }
      });
    } catch (error) {
      console.error(`Error in ${command} command:`, error);
    }
  }
});

// Clean up popupWindowId when window is closed
chrome.windows.onRemoved.addListener((windowId) => {
  if (windowId === popupWindowId) {
    popupWindowId = null;
  }
});

// Add proper message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle any messages from popup or content script
  if (message.action === 'toggleTeleprompter') {
    // Handle toggle action
    sendResponse({ success: true });
    return false;
  }
  
  // Always send a response for any unhandled messages
  sendResponse({ success: true });
  return false;
}); 