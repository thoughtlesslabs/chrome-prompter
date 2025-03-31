let currentSpeed = 1;

document.getElementById('toggleBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    chrome.tabs.sendMessage(tab.id, { action: 'toggleTeleprompter' });
  }
});

document.getElementById('increaseSpeed').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    chrome.tabs.sendMessage(tab.id, { action: 'increase-speed' });
  }
});

document.getElementById('decreaseSpeed').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    chrome.tabs.sendMessage(tab.id, { action: 'decrease-speed' });
  }
});

// Listen for state updates from content script
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'updateState') {
    document.getElementById('toggleBtn').textContent =
      message.isScrolling ? 'Stop' : 'Start';
  }
});

function updateSpeed() {
  document.getElementById('speedValue').textContent = currentSpeed + 'x';
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'updateSpeed',
        speed: currentSpeed
      });
    }
  });
} 