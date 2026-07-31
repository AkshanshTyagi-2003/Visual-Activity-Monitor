/**
 * Content Script - Visual Activity Monitor
 * Tracks page focus and notifies background service worker.
 */

// Notify background worker when page gains or loses focus
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    chrome.runtime.sendMessage({
      type: 'PAGE_FOCUSED',
      url: window.location.href,
      title: document.title,
    }).catch(() => {});
  }
});
