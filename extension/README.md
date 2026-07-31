# Visual Activity Monitor - Chrome Extension

Manifest V3 Chrome Extension that monitors browser tab activity, records active time spent per website, captures visual tab screenshots every 15 seconds, and logs data to PostgreSQL/Supabase via the backend API.

## Features
- **Active Tab Detection:** Automatically detects active tab title, URL, and visit timestamp.
- **Active Time Tracker:** Tracks precise duration spent on each website across tab switches and navigation events.
- **Automated Screenshots:** Captures a visible screenshot every 15 seconds using `chrome.tabs.captureVisibleTab`.
- **Cloud Storage:** Uploads captured screenshots to Supabase Storage and records metadata in PostgreSQL via Prisma.

## How to Install in Google Chrome
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** using the toggle switch in the top right corner.
3. Click **Load unpacked**.
4. Select the `extension` directory from this project folder.
5. Click the extension icon in Chrome and paste your JWT Auth Token (generated via the Web Dashboard register/login screen).
