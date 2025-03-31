// Prevent multiple injections by using an IIFE
(function () {
  // Only execute if we haven't already
  if (window._chromePrompterLoaded) return;
  window._chromePrompterLoaded = true;

  // Configuration
  const BASE_SCROLL_SPEED = 0.5; // Reduced base speed
  const SCROLL_INTERVAL = 16; // ~60fps for smoother animation
  const UI_FADE_DELAY = 2000; // 2 seconds before UI fades

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
  let uiFadeTimer = null;

  // Get color scheme based on system preference
  function getColorScheme() {
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

    return {
      background: isDarkMode ? '#333333' : 'white',
      text: isDarkMode ? '#ffffff' : '#333333',
      border: isDarkMode ? '#555555' : '#cccccc',
      buttonBg: isDarkMode ? '#444444' : '#f0f0f0',
      buttonText: isDarkMode ? '#ffffff' : '#333333',
      shadow: isDarkMode ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)',
      kbd: {
        bg: isDarkMode ? '#555555' : '#f5f5f5',
        border: isDarkMode ? '#666666' : '#cccccc',
        text: isDarkMode ? '#ffffff' : '#333333'
      }
    };
  }

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
      updateControlPanel();
    }
  }

  // Function to start scrolling
  function startScrolling() {
    if (!scrollState.isScrolling) {
      scrollState.isScrolling = true;
      scrollState.currentPosition = window.scrollY;
      scrollState.intervalId = setInterval(scroll, SCROLL_INTERVAL);
      updateControlPanel();
    }
  }

  // Function to stop scrolling
  function stopScrolling() {
    if (scrollState.isScrolling) {
      clearInterval(scrollState.intervalId);
      scrollState.isScrolling = false;
      updateControlPanel();
    }
  }

  // Toggle scrolling state
  function toggleScrolling() {
    if (scrollState.isScrolling) {
      stopScrolling();
    } else {
      startScrolling();
    }
  }

  // Function to set UI opacity
  function setUIOpacity(opacity) {
    if (controlPanel) {
      controlPanel.style.opacity = opacity;
    }
  }

  // Function to reset the UI fade timer
  function resetUIFadeTimer() {
    // Clear existing timer
    if (uiFadeTimer) {
      clearTimeout(uiFadeTimer);
    }

    // Set UI to full opacity
    setUIOpacity(1);

    // Set new timer
    uiFadeTimer = setTimeout(() => {
      setUIOpacity(0.15); // 15% opacity
    }, UI_FADE_DELAY);
  }

  // Create floating UI controls
  function createControlPanel() {
    if (controlPanel) {
      controlPanel.style.display = 'block';
      controlPanel.style.opacity = '0';

      // Ensure smooth animation by using setTimeout
      setTimeout(() => {
        controlPanel.style.opacity = '1';
      }, 10);

      uiVisible = true;
      resetUIFadeTimer();
      return;
    }

    // Detect OS for correct keyboard shortcuts
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modifierKey = isMac ? '⌘' : 'Ctrl';

    // Get color scheme
    const colors = getColorScheme();

    // Create panel
    controlPanel = document.createElement('div');
    controlPanel.id = 'chrome-prompter-controls';
    controlPanel.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: ${colors.background};
      color: ${colors.text};
      border-bottom: 1px solid ${colors.border};
      padding: 10px 20px;
      box-shadow: 0 2px 5px ${colors.shadow};
      z-index: 2147483647;
      font-family: Arial, sans-serif;
      display: block;
      transition: opacity 0.3s ease;
      opacity: 0;
    `;

    // Create container for better layout
    const contentContainer = document.createElement('div');
    contentContainer.style.cssText = `
      display: flex;
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
      justify-content: space-between;
      align-items: center;
      position: relative;
    `;
    controlPanel.appendChild(contentContainer);

    // Create left section for shortcuts
    const shortcutsSection = document.createElement('div');
    shortcutsSection.style.cssText = 'display: flex; align-items: center; gap: 15px; font-size: 12px; position: absolute; left: 0;';

    // Add keyboard shortcut info
    shortcutsSection.innerHTML = `
      <div>
        <kbd style="background: ${colors.kbd.bg}; color: ${colors.kbd.text}; border: 1px solid ${colors.kbd.border}; border-radius: 3px; padding: 2px 5px;">${modifierKey}</kbd>+<kbd style="background: ${colors.kbd.bg}; color: ${colors.kbd.text}; border: 1px solid ${colors.kbd.border}; border-radius: 3px; padding: 2px 5px;">Shift</kbd>+<kbd style="background: ${colors.kbd.bg}; color: ${colors.kbd.text}; border: 1px solid ${colors.kbd.border}; border-radius: 3px; padding: 2px 5px;">P</kbd> Start/Stop
      </div>
      <div>
        <kbd style="background: ${colors.kbd.bg}; color: ${colors.kbd.text}; border: 1px solid ${colors.kbd.border}; border-radius: 3px; padding: 2px 5px;">${modifierKey}</kbd>+<kbd style="background: ${colors.kbd.bg}; color: ${colors.kbd.text}; border: 1px solid ${colors.kbd.border}; border-radius: 3px; padding: 2px 5px;">Shift</kbd>+<kbd style="background: ${colors.kbd.bg}; color: ${colors.kbd.text}; border: 1px solid ${colors.kbd.border}; border-radius: 3px; padding: 2px 5px;">↑/↓</kbd> Speed
      </div>
    `;

    // Create middle section for controls
    const controlsSection = document.createElement('div');
    controlsSection.style.cssText = 'display: flex; align-items: center; gap: 15px; justify-content: center; flex-grow: 1; margin: 0 auto;';

    // Toggle button
    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = scrollState.isScrolling ? 'Stop' : 'Start';
    toggleBtn.style.cssText = `
      padding: 8px 15px;
      cursor: pointer;
      font-weight: bold;
      background: ${colors.buttonBg};
      color: ${colors.buttonText};
      border: 1px solid ${colors.border};
      border-radius: 4px;
    `;
    toggleBtn.addEventListener('click', () => {
      toggleScrolling();
      resetUIFadeTimer();
    });

    // Speed controls
    const speedControls = document.createElement('div');
    speedControls.style.cssText = 'display: flex; align-items: center; gap: 10px;';

    const speedLabel = document.createElement('span');
    speedLabel.textContent = 'Speed:';

    const decreaseBtn = document.createElement('button');
    decreaseBtn.textContent = '-';
    decreaseBtn.style.cssText = `
      padding: 5px 10px;
      cursor: pointer;
      background: ${colors.buttonBg};
      color: ${colors.buttonText};
      border: 1px solid ${colors.border};
      border-radius: 4px;
    `;
    decreaseBtn.addEventListener('click', () => {
      scrollState.speedMultiplier = Math.max(scrollState.speedMultiplier - 0.25, 0.25);
      updateSpeedDisplay();
      resetUIFadeTimer();
    });

    const speedDisplay = document.createElement('span');
    speedDisplay.id = 'speed-value';
    speedDisplay.textContent = `${scrollState.speedMultiplier}x`;
    speedDisplay.style.cssText = 'min-width: 40px; text-align: center;';

    const increaseBtn = document.createElement('button');
    increaseBtn.textContent = '+';
    increaseBtn.style.cssText = `
      padding: 5px 10px;
      cursor: pointer;
      background: ${colors.buttonBg};
      color: ${colors.buttonText};
      border: 1px solid ${colors.border};
      border-radius: 4px;
    `;
    increaseBtn.addEventListener('click', () => {
      scrollState.speedMultiplier = Math.min(scrollState.speedMultiplier + 0.25, 3);
      updateSpeedDisplay();
      resetUIFadeTimer();
    });

    // Create right section for close button
    const closeSection = document.createElement('div');
    closeSection.style.cssText = 'position: absolute; right: 0;';

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.style.cssText = `
      padding: 8px 15px;
      cursor: pointer;
      background: ${colors.buttonBg};
      color: ${colors.buttonText};
      border: 1px solid ${colors.border};
      border-radius: 4px;
    `;
    closeBtn.addEventListener('click', () => {
      // Stop scrolling if it's active before hiding the panel
      if (scrollState.isScrolling) {
        stopScrolling();
      }
      hideControlPanel();
      resetUIFadeTimer();
    });

    // Assemble everything
    speedControls.appendChild(speedLabel);
    speedControls.appendChild(decreaseBtn);
    speedControls.appendChild(speedDisplay);
    speedControls.appendChild(increaseBtn);

    controlsSection.appendChild(toggleBtn);
    controlsSection.appendChild(speedControls);

    closeSection.appendChild(closeBtn);

    contentContainer.appendChild(shortcutsSection);
    contentContainer.appendChild(controlsSection);
    contentContainer.appendChild(closeSection);

    // Insert at the beginning of body
    document.body.insertBefore(controlPanel, document.body.firstChild);

    // Add mouse hover event to prevent UI from fading when hovered
    controlPanel.addEventListener('mouseenter', () => {
      setUIOpacity(1);
      clearTimeout(uiFadeTimer);
    });

    controlPanel.addEventListener('mouseleave', () => {
      resetUIFadeTimer();
    });

    // Set up UI fade timer
    resetUIFadeTimer();

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
        toggleBtn.textContent = scrollState.isScrolling ? 'Stop' : 'Start';
      }
    }
  }

  // Update the hideControlPanel function to restore original body padding
  function hideControlPanel() {
    if (controlPanel) {
      // Animate out
      controlPanel.style.opacity = '0';

      // Remove after animation completes
      setTimeout(() => {
        controlPanel.style.display = 'none';
      }, 300);

      uiVisible = false;
    }
  }

  // Update toggleControlPanelVisibility to use the new hide function
  function toggleControlPanelVisibility() {
    if (uiVisible) {
      hideControlPanel();
    } else {
      createControlPanel();
    }
  }

  // Update the UI color scheme when system preference changes
  function updateColorScheme() {
    if (controlPanel) {
      const colors = getColorScheme();

      // Update main panel
      controlPanel.style.background = colors.background;
      controlPanel.style.color = colors.text;
      controlPanel.style.borderBottom = `1px solid ${colors.border}`;
      controlPanel.style.boxShadow = `0 2px 5px ${colors.shadow}`;

      // Update buttons
      const buttons = controlPanel.querySelectorAll('button');
      buttons.forEach(button => {
        button.style.background = colors.buttonBg;
        button.style.color = colors.buttonText;
        button.style.border = `1px solid ${colors.border}`;
      });

      // Update kbd elements
      const kbdElements = controlPanel.querySelectorAll('kbd');
      kbdElements.forEach(kbd => {
        kbd.style.background = colors.kbd.bg;
        kbd.style.color = colors.kbd.text;
        kbd.style.border = `1px solid ${colors.kbd.border}`;
      });
    }
  }

  // Handle message listener with proper response handling
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'ping') {
      sendResponse({ success: true });
      return false; // Not using asynchronous response
    }

    // Reset fade timer for any message action
    resetUIFadeTimer();

    // Always show the control panel when receiving keyboard shortcut messages
    if (message.action === 'toggleTeleprompter' ||
      message.action === 'increase-speed' ||
      message.action === 'decrease-speed') {
      // Make sure UI is visible when shortcuts are used
      createControlPanel();
    }

    if (message.action === 'toggleTeleprompter') {
      // Simply toggle scrolling with one press
      toggleScrolling();
      sendResponse({ success: true });
    } else if (message.action === 'increase-speed') {
      scrollState.speedMultiplier = Math.min(scrollState.speedMultiplier + 0.25, 3);
      updateSpeedDisplay();
      sendResponse({ success: true });
    } else if (message.action === 'decrease-speed') {
      scrollState.speedMultiplier = Math.max(scrollState.speedMultiplier - 0.25, 0.25);
      updateSpeedDisplay();
      sendResponse({ success: true });
    } else if (message.action === 'toggleUI') {
      toggleControlPanelVisibility();
      sendResponse({ success: true });
    }

    return false; // We've handled the response synchronously
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

  // Keyboard event listener - ensure UI is shown when shortcuts are used
  document.addEventListener('keydown', function (e) {
    // Reset fade timer on any keypress
    resetUIFadeTimer();

    // Check for our keyboard shortcuts
    if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
      if (e.key === 'p' || e.key === 'P') {
        // Make sure UI is visible and toggle scrolling
        createControlPanel();
        toggleScrolling();
      } else if (e.key === 'ArrowUp') {
        // Make sure UI is visible and increase speed
        createControlPanel();
        scrollState.speedMultiplier = Math.min(scrollState.speedMultiplier + 0.25, 3);
        updateSpeedDisplay();
      } else if (e.key === 'ArrowDown') {
        // Make sure UI is visible and decrease speed
        createControlPanel();
        scrollState.speedMultiplier = Math.max(scrollState.speedMultiplier - 0.25, 0.25);
        updateSpeedDisplay();
      }
    }
  });

  console.log('Chrome Prompter content script loaded');
})(); 