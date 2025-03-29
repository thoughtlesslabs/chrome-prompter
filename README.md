# Chrome Prompter

A browser extension that auto-scrolls any webpage for hands-free reading — just like a teleprompter.

## Folder Structure

This repository contains two versions of the extension:

- **chrome/** - Contains the Chrome version of the extension
- **firefox/** - Contains the Firefox version of the extension

## Features

- Auto-scrolling functionality with adjustable speed
- Keyboard shortcuts for easy control
- Minimal UI that fades when not in use
- Works on any webpage

## Chrome Version

The Chrome version uses the following keyboard shortcuts:

- **Ctrl+Shift+P** (Mac: **Cmd+Shift+P**): Toggle teleprompter
- **Ctrl+Shift+Up** (Mac: **Cmd+Shift+Up**): Increase speed
- **Ctrl+Shift+Down** (Mac: **Cmd+Shift+Down**): Decrease speed

## Firefox Version

The Firefox version uses different keyboard shortcuts to avoid conflicts with Firefox's built-in shortcuts:

- **Alt+Shift+P**: Toggle teleprompter
- **Alt+Shift+Up**: Increase speed
- **Alt+Shift+Down**: Decrease speed

## Installation

### Chrome

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `chrome` folder

### Firefox

1. Download or clone this repository
2. Open Firefox and go to `about:debugging`
3. Click "This Firefox"
4. Click "Load Temporary Add-on" and select any file in the `firefox` folder

## License

MIT
