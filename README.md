# Chrome Prompter

A lightweight Chrome extension that turns any webpage into a teleprompter with smooth auto-scrolling functionality.

## Features

- Smooth auto-scrolling on any webpage
- Keyboard shortcut control (Cmd+Shift+T on Mac, Ctrl+Shift+T on Windows/Linux)
- Four-state toggle: Start → Pause → Resume → Stop
- Support for selected text scrolling
- No UI clutter - works silently in the background
- Works with most websites and content types

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory

## Usage

1. Navigate to any webpage with scrollable content
2. (Optional) Select specific text to scroll only that section
3. Press Cmd+Shift+T (Mac) or Ctrl+Shift+T (Windows/Linux) to:
   - First press: Start scrolling
   - Second press: Pause scrolling
   - Third press: Resume scrolling
   - Fourth press: Stop and reset

## Customization

You can modify the scroll speed and interval by editing the constants in `content.js`:

- `SCROLL_SPEED`: Pixels to scroll each time (default: 30)
- `SCROLL_INTERVAL`: Milliseconds between scrolls (default: 500)

## Notes

- The extension works best with standard webpage layouts
- Some websites with complex frames or dynamic content may have limited functionality
- Sticky headers and fixed elements may affect scrolling behavior
