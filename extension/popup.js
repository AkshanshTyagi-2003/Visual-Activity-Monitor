/**
 * Extension Popup Script
 */

document.addEventListener('DOMContentLoaded', () => {
  const loginSection = document.getElementById('loginSection');
  const activeSection = document.getElementById('activeSection');
  const statusDot = document.getElementById('statusDot');
  const statusBadge = document.getElementById('statusBadge');
  const apiUrlInput = document.getElementById('apiUrl');
  const tokenInput = document.getElementById('tokenInput');
  const saveBtn = document.getElementById('saveBtn');
  const currentTabUrl = document.getElementById('currentTabUrl');
  const trackingToggle = document.getElementById('trackingToggle');
  const captureNowBtn = document.getElementById('captureNowBtn');
  const openDashboardBtn = document.getElementById('openDashboardBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  // Load state on popup load
  chrome.storage.local.get(['token', 'apiUrl', 'trackingEnabled'], (items) => {
    if (items.apiUrl) apiUrlInput.value = items.apiUrl;
    if (items.token) {
      showConnectedState(items.token);
    } else {
      showDisconnectedState();
    }

    if (items.trackingEnabled !== undefined) {
      trackingToggle.checked = items.trackingEnabled;
    }
  });

  // Query background worker status
  chrome.runtime.sendMessage({ type: 'GET_STATUS' }, (res) => {
    if (chrome.runtime.lastError || !res) return;
    if (res.activeUrl) {
      currentTabUrl.textContent = res.activeUrl;
    } else {
      currentTabUrl.textContent = 'Active tab monitoring...';
    }
  });

  // Handle Save Credentials
  saveBtn.addEventListener('click', () => {
    const token = tokenInput.value.trim();
    const apiUrl = apiUrlInput.value.trim() || 'http://localhost:3000/api';

    if (!token) {
      alert('Please enter a valid JWT auth token.');
      return;
    }

    chrome.storage.local.set({ token, apiUrl }, () => {
      showConnectedState(token);
    });
  });

  // Toggle Tracking ON/OFF
  trackingToggle.addEventListener('change', (e) => {
    const enabled = e.target.checked;
    chrome.storage.local.set({ trackingEnabled: enabled });
  });

  // Trigger manual screenshot capture
  captureNowBtn.addEventListener('click', () => {
    captureNowBtn.textContent = 'Capturing...';
    captureNowBtn.disabled = true;

    chrome.runtime.sendMessage({ type: 'TRIGGER_CAPTURE' }, () => {
      setTimeout(() => {
        captureNowBtn.textContent = 'Capture Screenshot Now';
        captureNowBtn.disabled = false;
      }, 1000);
    });
  });

  // Open Web Dashboard
  openDashboardBtn.addEventListener('click', () => {
    chrome.storage.local.get(['apiUrl'], (items) => {
      const baseUrl = items.apiUrl ? items.apiUrl.replace(/\/api$/, '') : 'http://localhost:3000';
      chrome.tabs.create({ url: baseUrl });
    });
  });

  // Disconnect Account
  logoutBtn.addEventListener('click', () => {
    chrome.storage.local.remove(['token'], () => {
      tokenInput.value = '';
      showDisconnectedState();
    });
  });

  function showConnectedState(token) {
    loginSection.classList.add('hidden');
    activeSection.classList.remove('hidden');
    statusDot.classList.add('active');
    statusBadge.textContent = 'Connected';
    statusBadge.className = 'badge success';
  }

  function showDisconnectedState() {
    loginSection.classList.remove('hidden');
    activeSection.classList.add('hidden');
    statusDot.classList.remove('active');
    statusBadge.textContent = 'Not Connected';
    statusBadge.className = 'badge';
  }
});
