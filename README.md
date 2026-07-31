# Visual Activity Monitor

A browser activity monitoring system made up of a **Chrome extension** and a **web dashboard**, built to track browsing activity, capture screenshots, and surface analytics in real time — all from a single, self-hosted dashboard.

## Overview

Visual Activity Monitor pairs a lightweight Chrome extension with a local dashboard application. Once connected, the extension runs quietly in the browser, capturing activity and periodic screenshots, and streaming that data back to your dashboard for review — no third-party servers involved, since everything runs on `localhost`.

It's designed for use cases like:

- Personal productivity tracking
- Monitoring browser activity on a shared or managed device
- Auditing time spent across websites during focused work sessions

## Features

- 🧩 **Chrome Extension** — a pinned toolbar icon ("V") that connects directly to your local backend via an API token
- 📊 **Live Dashboard** — a web frontend for reviewing activity, screenshots, and analytics
- 📸 **Automatic Screenshots** — captured at a configurable interval once the extension is connected
- 🔐 **Token-Based Auth** — connections are authenticated with a JWT token generated per account
- 🔄 **Real-Time Sync** — activity and screenshots sync from the extension to the dashboard automatically
- 🟢 **Connection Status** — a visual (green) indicator confirms when the extension is actively connected

## How It Works

1. The **backend API** and **frontend dashboard** run locally as a single app (`npm run dev`).
2. You create an account on the dashboard and retrieve your **API Base URL** and **JWT Auth Token** from the Extension Setup page.
3. The **Chrome extension** (loaded separately as an unpacked extension) is connected using those two values.
4. Once connected, the extension monitors browser activity and takes screenshots at set intervals, syncing everything back to the dashboard.
5. All activity, screenshots, and analytics are viewable live on the dashboard.

## Tech Stack

| Layer | Details |
|---|---|
| Frontend Dashboard | Vite-based web app (`localhost:5173`) |
| Backend API | Node-based server (`localhost:5000`) |
| Browser Integration | Chrome Extension (Manifest, loaded via `extension/` folder) |
| Auth | JWT-based token authentication |

*(Update this table with your actual frameworks/libraries — e.g., React, Express, MongoDB — if you'd like it to be fully accurate.)*

## Project Structure

```
.
├── extension/         # Chrome extension source (loaded via chrome://extensions)
├── src/ or client/     # Frontend dashboard
├── server/ or api/     # Backend API
├── .env.example        # Template for required environment variables
└── package.json
```

*(Adjust folder names above to match your actual repo layout.)*

## Getting Started

Setup and installation steps — including running the app locally, installing the Chrome extension, and connecting it to the dashboard — are covered in [`Installation Guide`](./Installation_Guide.md).

## Screenshots

<img width="1470" height="834" alt="image" src="https://github.com/user-attachments/assets/cb0497bb-39e1-4d12-9be2-148f540fd590" />
<br><br>
<img width="1470" height="769" alt="image" src="https://github.com/user-attachments/assets/8438be0d-7ef3-4319-a4aa-3fc6c4a466b2" />



