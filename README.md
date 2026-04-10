# G-Shock Smart Sync Webapp

**Manage your G-Shock watch directly from your browser—no phone app required.**

G-Shock Smart Sync Webapp is a lightweight, privacy-focused web tool that lets you set the time, manage alarms, and configure reminders on your watch using only your browser. It provides a clean, modern alternative to official mobile apps, working seamlessly on any device that supports Web Bluetooth.

---

### 🧪 [Try the Experimental Demo](https://gshock.avmedia.org)
*URL: **https://gshock.avmedia.org***

**Note:** This server is provided for **evaluation only**. It runs on limited hardware and may be shut down temporarily or permanently if traffic levels become too high. For a stable, permanent experience, we recommend [hosting the app on your own hardware](#🖥️-deploy-on-your-own-hardware).

---

## ✨ Core Features
- **⏰ Precise Time Sync**: Synchronize your watch with atomic-clock precision.
- **📅 Alarm Management**: Easily set and toggle all 5 watch alarms.
- **🔔 Reminders**: Configure and name your watch reminders/events.
- **⚙️ Watch Settings**: Adjust illumination, sound, and display options.
- **🔌 No App Needed**: No installation, no accounts, and no tracking.

## 📱 How to Use
1.  **Open the link** above (Chrome, Edge, or Opera recommended).
2.  **Enable Bluetooth** on your computer or phone.
3.  **Click "Pair Watch"** and select your G-Shock from the list.

### Supported Browsers
*   **Desktop:** Chrome, Edge, Opera.
*   **Android:** Chrome.
*   **iOS/iPhone:** Use the **Bluefy** or **WebBLE** browsers from the App Store.
*   *Note: Safari and Firefox do not currently support Bluetooth syncing.*

## 🔒 Privacy & Security
This application is **strictly private**. 
- **No data is ever sent to a server.** 
- All communication happens directly between your browser and your watch. 
- Your personal settings, alarms, and reminders are never tracked or stored outside your own device.

---

## 🛠 For Developers & Advanced Users

### Development
To run locally for development:
```bash
npm install
npm run dev
```

### Deployment
Detailed instructions for hosting this yourself on a Raspberry Pi or other hardware can be found in the documentation files below.

### Documentation Index
- **[QUICK-START.md](./QUICK-START.md)** - Step-by-step setup guide
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Technical reference
- **[DEPLOYMENT-SUMMARY.md](./DEPLOYMENT-SUMMARY.md)** - 3-step deployment summary

To use this application, your browser must support **Web Bluetooth**. If you are accessing via a non-secure connection (HTTP), you must manually enable support:

### 1. Supported Browsers
- **Desktop:** Google Chrome, Microsoft Edge, and Opera (Windows, macOS, Linux).
- **Mobile:** Chrome for Android; **Bluefy** or **WebBLE** for iOS/iPadOS.
- **Unsupported:** Safari and Firefox.

### 2. Quick Setup
1. **Enable Flags:** Navigate to `chrome://flags` (or `edge://flags`), search for **#web-bluetooth**, and set it to **Enabled**. Restart your browser.
2. **Grant Permissions:** Ensure Bluetooth and **Location Services** (on Android/Windows) are turned **ON**.
3. **Pairing:** Click the "Pair Watch" button in the app and select your device from the browser's pop-up list.

---

## Development

To run the application in development mode:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The application will auto-reload as you make changes to the source files.

## 🖥️ Deploy on Your Own Hardware

You can run this application on any machine that supports Node.js (Linux, Windows, or macOS).

### Standard Deployment (Linux, macOS, Windows)

1. **Clone and Install:**
   ```bash
   git clone https://github.com/izivkov/gshock-smart-sync-webapp.git
   cd gshock-smart-sync-webapp
   npm install
   ```
2. **Build and Start:**
   ```bash
   npm run build
   npm start
   ```
   The application will be available at `http://localhost:3000`.

---

### 🍓 Raspberry Pi (Automated Deployment)

If you are deploying to a remote Raspberry Pi, we provide automated scripts to simplify the process.

1. **Configure your Pi's details** in `deploy-rpi.sh`:
   ```bash
   RPI_USER="your-username"
   RPI_HOST="your-pi-ip-address"
   ```
2. **Run the deployment:**
   ```bash
   # On your local machine
   ./deploy-rpi.sh
   ```
3. **One-time setup (on the Pi):**
   ```bash
   cd /home/your-username/gshock-smart-sync
   chmod +x setup-rpi.sh
   ./setup-rpi.sh
   ```

---

### Documentation

- **[DEPLOYMENT-README.md](./DEPLOYMENT-README.md)** - Navigation guide for all deployment docs
- **[DEPLOYMENT-SUMMARY.md](./DEPLOYMENT-SUMMARY.md)** - Overview and quick 3-step deployment
- **[QUICK-START.md](./QUICK-START.md)** - Comprehensive step-by-step guide
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - In-depth technical reference

### Files Included

- `deploy-rpi.sh` - Automated one-command deployment
- `setup-rpi.sh` - Standalone server setup script
- `check-deploy.sh` - Pre-flight system verification

## Features

- ✅ Material Design 3 UI with warm brown color scheme
- ✅ Bluetooth connectivity to 19 G-Shock watch models
- ✅ Time synchronization and Battery display
- ✅ Alarm management (up to 5 alarms)
- ✅ Event/Reminder management (up to 5 reminders)
- ✅ Settings configuration
- ✅ Real-time user feedback (Snackbar notifications)
- ✅ Dynamic UI based on watch capabilities
- ✅ Auto-navigation on watch connection
- ✅ Systemd service for auto-start on reboot

## Supported Watches

The application supports 19 G-Shock models including:
- GA series (Classic, Basic)
- GW series (Radio-controlled, Solar)
- DW series (Digital)
- GMW series (Module)
- And more...

Each model has intelligent capability detection for feature adaptation.

```
