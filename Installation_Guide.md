# Visual Activity Monitor

A browser activity monitoring tool with a Chrome extension frontend and a local dashboard for tracking activity, screenshots, and analytics in real time.

## Installation & Setup Guide

### Step 1: Download the Project

1. Download or clone the complete project from the GitHub repository:
   ```bash
   git clone https://github.com/<your-username>/<your-repo>.git
   ```
2. Extract the downloaded ZIP file (if applicable).
3. Open the project in your preferred code editor (e.g., Visual Studio Code).

> **Note:** The Chrome extension is located inside the `extension/` folder of the project. You will need this folder when loading the extension into Chrome.

---

### Step 2: Run the Project Locally

**Install Dependencies**

Open a terminal inside the project directory and run:

```bash
npm install
```

**Configure Environment Variables**

Create the required `.env` file(s) using the provided `.env.example` and add your configuration values:

```bash
cp .env.example .env
```

**Start the Application**

```bash
npm run dev
```

Once the application starts successfully:

| Service | URL |
|---|---|
| Frontend Dashboard | http://localhost:5173 |
| Backend API | http://localhost:5000 |

> Keep both servers running while using the extension.

---

### Step 3: Install the Chrome Extension

1. Open Google Chrome.
2. Navigate to:
   ```
   chrome://extensions
   ```
3. Enable **Developer Mode** using the toggle in the top-right corner.
4. Click **Load unpacked**.
5. Browse to the downloaded project folder.
6. Select the `extension/` folder.
7. Click **Select Folder**.

The Visual Activity Monitor extension will now be installed.

---

### Step 4: Pin the Extension

1. Click the **Extensions (🧩)** icon in the Chrome toolbar.
2. Locate **Visual Activity Monitor**.
3. Click the **Pin (📌)** icon.

The "V" icon will now appear permanently beside the Chrome address bar.

---

### Step 5: Get Your Connection Details

1. Open the dashboard in your browser:
   ```
   http://localhost:5173
   ```
2. Create a new account or log in.
3. After logging in, navigate to **Extension Setup**.

The page will display:

- API Base URL
- JWT Auth Token

Copy both values.

---

### Step 6: Connect the Extension

1. Click the **"V"** icon in the Chrome toolbar.
2. A popup will appear containing two input fields:
   - API Base URL
   - JWT Auth Token
3. Paste the values you copied from the dashboard into their respective fields.
4. Click **Save** (or **Connect**).

---

### Step 7: Verify the Connection

If the connection is successful:

- ✅ The extension status will change to **Connected**.
- ✅ A green status indicator will appear.
- ✅ Browser activity monitoring will begin automatically.
- ✅ Screenshots will be captured at the configured interval.
- ✅ All captured activity and screenshots will be synchronized with your dashboard.

You can now monitor browser activity, screenshots, and analytics directly from the dashboard running on `http://localhost:5173`.

---

## Quick Start Summary

```bash
# 1. Clone the repo
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env

# 4. Run the app
npm run dev
```

Then load the `extension/` folder via `chrome://extensions` → **Load unpacked**, pin it, and connect it using the API Base URL and JWT Auth Token from **Extension Setup** on the dashboard.