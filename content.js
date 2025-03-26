// Configuration
const BASE_SCROLL_SPEED = 0.5; // Reduced base speed
const SCROLL_INTERVAL = 16; // ~60fps for smoother animation

// State management
let scrollState = {
  isScrolling: false,
  intervalId: null,
  pressCount: 0,
  selectedText: null,
  currentPosition: 0,
  speedMultiplier: 1
};

// UI state
let uiVisible = false;
let controlPanel = null;

// Helper function to get the scrollable container
function getScrollableContainer() {
  // If text is selected, use the selected element
  if (scrollState.selectedText) {
    return scrollState.selectedText;
  }
  
  // Check if body is scrollable
  if (document.body.scrollHeight > document.body.clientHeight) {
    return document.body;
  }
  
  // Fallback to documentElement
  return document.documentElement;
}

// Main scroll function
function scroll() {
  const container = getScrollableContainer();
  scrollState.currentPosition += (BASE_SCROLL_SPEED * scrollState.speedMultiplier);
  
  window.scrollTo({
    top: scrollState.currentPosition,
    behavior: 'auto'
  });

  // Stop if we've reached the bottom
  if (scrollState.currentPosition >= container.scrollHeight - window.innerHeight) {
    clearInterval(scrollState.intervalId);
    scrollState.isScrolling = false;
    scrollState.pressCount = 0;
    updateControlPanel();
  }
}

// Create floating UI controls
function createControlPanel() {
  if (controlPanel) {
    controlPanel.style.display = 'block';
    uiVisible = true;
    return;
  }

  // Create panel
  controlPanel = document.createElement('div');
  controlPanel.id = 'chrome-prompter-controls';
  controlPanel.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 15px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    z-index: 9999;
    font-family: Arial, sans-serif;
    width: 250px;
  `;

  // Add controls
  const toggleBtn = document.createElement('button');
  toggleBtn.textContent = scrollState.isScrolling ? 'Pause' : 'Start';
  toggleBtn.style.cssText = 'width: 100%; padding: 8px; margin-bottom: 10px; cursor: pointer;';
  toggleBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'toggleTeleprompter' });
  });

  const speedControls = document.createElement('div');
  speedControls.style.cssText = 'display: flex; align-items: center; gap: 10px; margin-bottom: 15px;';
  
  const speedLabel = document.createElement('span');
  speedLabel.textContent = 'Speed:';
  
  const decreaseBtn = document.createElement('button');
  decreaseBtn.textContent = '-';
  decreaseBtn.style.cssText = 'padding: 5px 10px; cursor: pointer;';
  decreaseBtn.addEventListener('click', () => {
    scrollState.speedMultiplier = Math.max(scrollState.speedMultiplier - 0.25, 0.25);
    updateSpeedDisplay();
  });
  
  const speedDisplay = document.createElement('span');
  speedDisplay.id = 'speed-value';
  speedDisplay.textContent = `${scrollState.speedMultiplier}x`;
  speedDisplay.style.cssText = 'min-width: 40px; text-align: center;';
  
  const increaseBtn = document.createElement('button');
  increaseBtn.textContent = '+';
  increaseBtn.style.cssText = 'padding: 5px 10px; cursor: pointer;';
  increaseBtn.addEventListener('click', () => {
    scrollState.speedMultiplier = Math.min(scrollState.speedMultiplier + 0.25, 3);
    updateSpeedDisplay();
  });
  
  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Close';
  closeBtn.style.cssText = 'width: 100%; padding: 8px; cursor: pointer;';
  closeBtn.addEventListener('click', () => {
    controlPanel.style.display = 'none';
    uiVisible = false;
  });
  
  // Add keyboard shortcut info
  const shortcuts = document.createElement('div');
  shortcuts.style.cssText = 'margin-top: 15px; padding-top: 15px; border-top: 1px solid #ccc; font-size: 12px;';
  shortcuts.innerHTML = `
    <h3 style="margin-top: 0; font-size: 14px;">Keyboard Shortcuts:</h3>
    <ul style="margin: 0; padding-left: 20px;">
      <li><kbd style="background: #f5f5f5; border: 1px solid #ccc; border-radius: 3px; padding: 2px 5px;">Ctrl</kbd>+<kbd style="background: #f5f5f5; border: 1px solid #ccc; border-radius: 3px; padding: 2px 5px;">Shift</kbd>+<kbd style="background: #f5f5f5; border: 1px solid #ccc; border-radius: 3px; padding: 2px 5px;">P</kbd> - Toggle scrolling</li>
      <li><kbd style="background: #f5f5f5; border: 1px solid #ccc; border-radius: 3px; padding: 2px 5px;">Ctrl</kbd>+<kbd style="background: #f5f5f5; border: 1px solid #ccc; border-radius: 3px; padding: 2px 5px;">Shift</kbd>+<kbd style="background: #f5f5f5; border: 1px solid #ccc; border-radius: 3px; padding: 2px 5px;">↑</kbd> - Increase speed</li>
      <li><kbd style="background: #f5f5f5; border: 1px solid #ccc; border-radius: 3px; padding: 2px 5px;">Ctrl</kbd>+<kbd style="background: #f5f5f5; border: 1px solid #ccc; border-radius: 3px; padding: 2px 5px;">Shift</kbd>+<kbd style="background: #f5f5f5; border: 1px solid #ccc; border-radius: 3px; padding: 2px 5px;">↓</kbd> - Decrease speed</li>
      <li>Mac users: Replace <kbd style="background: #f5f5f5; border: 1px solid #ccc; border-radius: 3px; padding: 2px 5px;">Ctrl</kbd> with <kbd style="background: #f5f5f5; border: 1px solid #ccc; border-radius: 3px; padding: 2px 5px;">⌘</kbd></li>
    </ul>
  `;
  
  // Assemble everything
  speedControls.appendChild(speedLabel);
  speedControls.appendChild(decreaseBtn);
  speedControls.appendChild(speedDisplay);
  speedControls.appendChild(increaseBtn);
  
  controlPanel.appendChild(toggleBtn);
  controlPanel.appendChild(speedControls);
  controlPanel.appendChild(closeBtn);
  controlPanel.appendChild(shortcuts);
  
  document.body.appendChild(controlPanel);
  uiVisible = true;
}

// Update speed display in the control panel
function updateSpeedDisplay() {
  if (controlPanel) {
    const speedDisplay = controlPanel.querySelector('#speed-value');
    if (speedDisplay) {
      speedDisplay.textContent = `${scrollState.speedMultiplier}x`;
    }
  }
}

// Update button text in the control panel
function updateControlPanel() {
  if (controlPanel) {
    const toggleBtn = controlPanel.querySelector('button');
    if (toggleBtn) {
      toggleBtn.textContent = scrollState.isScrolling ? 'Pause' : 'Start';
    }
  }
}

// Toggle UI visibility
function toggleControlPanelVisibility() {
  if (uiVisible) {
    controlPanel.style.display = 'none';
    uiVisible = false;
  } else {
    createControlPanel();
  }
}

// Handle message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'ping') {
    sendResponse(true);
    return true;
  }
  
  if (message.action === 'toggleTeleprompter') {
    scrollState.pressCount = (scrollState.pressCount + 1) % 4;
    
    switch (scrollState.pressCount) {
      case 1: // Start scrolling
        if (!scrollState.isScrolling) {
          scrollState.isScrolling = true;
          scrollState.currentPosition = window.scrollY;
          scrollState.intervalId = setInterval(scroll, SCROLL_INTERVAL);
          createControlPanel(); // Show UI when starting
        }
        break;
        
      case 2: // Pause
        if (scrollState.isScrolling) {
          clearInterval(scrollState.intervalId);
          scrollState.isScrolling = false;
        }
        break;
        
      case 3: // Resume
        if (!scrollState.isScrolling) {
          scrollState.isScrolling = true;
          scrollState.intervalId = setInterval(scroll, SCROLL_INTERVAL);
        }
        break;
        
      case 0: // Stop and reset
        clearInterval(scrollState.intervalId);
        scrollState.isScrolling = false;
        scrollState.currentPosition = 0;
        break;
    }
    
    updateControlPanel();
  } else if (message.action === 'increase-speed') {
    scrollState.speedMultiplier = Math.min(scrollState.speedMultiplier + 0.25, 3);
    updateSpeedDisplay();
  } else if (message.action === 'decrease-speed') {
    scrollState.speedMultiplier = Math.max(scrollState.speedMultiplier - 0.25, 0.25);
    updateSpeedDisplay();
  } else if (message.action === 'toggleUI') {
    toggleControlPanelVisibility();
  }
  
  return true;
});

// Handle text selection
document.addEventListener('mouseup', () => {
  const selection = window.getSelection();
  if (selection.toString().trim()) {
    scrollState.selectedText = selection.anchorNode.parentElement;
  } else {
    scrollState.selectedText = null;
  }
});

console.log('Chrome Prompter content script loaded'); 