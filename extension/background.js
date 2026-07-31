/**
 * Background Service Worker - Manifest V3
 * Visual Activity Monitor Extension
 */

let activeTabId = null;
let activeTabUrl = '';
let activeTabTitle = '';
let tabStartTime = Date.now();
let isTrackingEnabled = true;

// Default API URL
const DEFAULT_API_URL = 'http://localhost:3000/api';

/**
 * Get stored settings (Auth Token & API URL)
 */
async function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['token', 'apiUrl', 'trackingEnabled'], (items) => {
      resolve({
        token: items.token || '',
        apiUrl: items.apiUrl || DEFAULT_API_URL,
        trackingEnabled: items.trackingEnabled !== false,
      });
    });
  });
}

/**
 * Log time spent on current tab before switching
 */
async function recordActiveTime() {
  if (!activeTabUrl || !isTrackingEnabled) return;

  const now = Date.now();
  const timeSpentSeconds = Math.round((now - tabStartTime) / 1000);

  if (timeSpentSeconds < 1) return; // Skip negligible durations

  const { token, apiUrl } = await getSettings();
  if (!token) return;

  try {
    await fetch(`${apiUrl}/activity/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        url: activeTabUrl,
        title: activeTabTitle || activeTabUrl,
        activeTime: timeSpentSeconds,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (err) {
    console.error('[Activity Monitor] Failed to send activity log:', err);
  }
}

/**
 * Handle Tab Activation (Switching tabs)
 */
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  await recordActiveTime();

  activeTabId = activeInfo.tabId;
  tabStartTime = Date.now();

  try {
    const tab = await chrome.tabs.get(activeTabId);
    if (tab && tab.url && !tab.url.startsWith('chrome://')) {
      activeTabUrl = tab.url;
      activeTabTitle = tab.title || '';
    } else {
      activeTabUrl = '';
      activeTabTitle = '';
    }
  } catch (err) {
    activeTabUrl = '';
    activeTabTitle = '';
  }
});

/**
 * Handle Tab Navigation / Updates
 */
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (tabId === activeTabId && changeInfo.status === 'complete') {
    if (tab.url && !tab.url.startsWith('chrome://')) {
      await recordActiveTime();
      activeTabUrl = tab.url;
      activeTabTitle = tab.title || '';
      tabStartTime = Date.now();
    }
  }
});

/**
 * Capture visible screenshot every 15 seconds
 */
async function captureAndUploadScreenshot() {
  const { token, apiUrl, trackingEnabled } = await getSettings();
  if (!token || !trackingEnabled) return;

  try {
    // Get currently active tab window
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
      return;
    }

    // Capture visible portion of active tab
    chrome.tabs.captureVisibleTab(null, { format: 'png', quality: 80 }, async (dataUrl) => {
      if (chrome.runtime.lastError || !dataUrl) {
        console.warn('[Activity Monitor] Screenshot capture skipped:', chrome.runtime.lastError?.message);
        return;
      }

      try {
        await fetch(`${apiUrl}/screenshots/upload`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            imageData: dataUrl,
            pageUrl: tab.url,
            pageTitle: tab.title || tab.url,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (err) {
        console.error('[Activity Monitor] Failed to upload screenshot:', err);
      }
    });
  } catch (err) {
    console.error('[Activity Monitor] Screenshot workflow error:', err);
  }
}

// Set up 15-second screenshot timer via Chrome Alarms API
chrome.alarms.create('captureScreenshotAlarm', { periodInMinutes: 0.25 }); // 15 seconds

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'captureScreenshotAlarm') {
    captureAndUploadScreenshot();
  }
});

// Listener for messages from popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_STATUS') {
    getSettings().then((settings) => {
      sendResponse({
        trackingEnabled: settings.trackingEnabled,
        apiUrl: settings.apiUrl,
        activeUrl: activeTabUrl,
        hasToken: Boolean(settings.token),
      });
    });
    return true; // Keep response channel open async
  }

  if (message.type === 'TRIGGER_CAPTURE') {
    captureAndUploadScreenshot().then(() => {
      sendResponse({ success: true });
    });
    return true;
  }
});
