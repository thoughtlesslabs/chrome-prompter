# Notes for Reviewers

## Auto-Scroll Screen Prompter / Chrome Prompter

**Version: 1.7 (Firefox) / 1.0 (Chrome)**

Thank you for reviewing our extension. This document provides information about the extension's functionality, permissions, and testing instructions to assist with your review.

### Extension Purpose

Auto-Scroll Screen Prompter is a simple utility extension that automatically scrolls any webpage at a consistent speed, similar to a teleprompter. It allows users to read content hands-free without needing to manually scroll.

### Requested Permissions Explanation

The extension requires the following permissions:

1. **activeTab**: Used to apply scrolling to the active browser tab
2. **scripting**: Required to inject the content script that controls scrolling behavior
3. **tabs**: Needed to properly manage the extension state across different tabs

None of these permissions are used to collect, store, or transmit any user data. The extension operates entirely locally and requires no external connections.

### Key Features

- Toggle auto-scrolling with keyboard shortcuts
- Increase/decrease scrolling speed with keyboard shortcuts
- Simple, intuitive controls

### Testing Instructions

1. **Installation**: Install the extension
2. **Basic Usage**: Navigate to any text-heavy webpage (like a news article or blog post)
3. **Activation**: Press the keyboard shortcut to activate scrolling:
   - Firefox: Alt+Shift+P
   - Chrome: Ctrl+Shift+P (or Command+Shift+P on Mac)
4. **Speed Control**: Use the following shortcuts to control scrolling speed:
   - Increase speed: Alt+Shift+Up (Firefox) or Ctrl/Command+Shift+Up (Chrome)
   - Decrease speed: Alt+Shift+Down (Firefox) or Ctrl/Command+Shift+Down (Chrome)
5. **Deactivation**: Press the toggle shortcut again to stop scrolling

### Technical Notes

- The extension includes a background script that handles keyboard shortcuts and communicates with the content script
- The content script implements the scrolling logic on the active webpage
- No data is collected, stored, or transmitted to external servers
- The extension does not modify webpage content, only controls scrolling behavior

### Additional Information

- This extension is now available for both Chrome and Firefox browsers
- We have thoroughly tested the extension on both platforms to ensure consistent behavior
- The extension contains no advertising or tracking components
- A complete privacy policy and EULA are included with the submission
- The extension is released under the MIT License

If you have any questions or need additional information during the review process, please contact us at <thoughtlesslabs@gmail.com>.
