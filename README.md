# G-Shock Smart Sync Webapp

**Manage your G-Shock watch directly from your browser—no phone app required.**

G-Shock Smart Sync Webapp is a lightweight, privacy-focused web tool that lets you set the time, manage alarms, and configure reminders on your watch using only your browser. It provides a clean, modern alternative to official mobile apps, working seamlessly on any device that supports Web Bluetooth.

---

### 🧪 [Live Demo (Experimental)](https://gshock.avmedia.org)
*URL: **https://gshock.avmedia.org***

**Note:** This server is experimental. For a stable, permanent experience, you can [host the app on your own hardware](#-self-hosting--development).

---

## ✨ Features
- **⏰ Precise Time Sync**: Synchronize your watch with atomic-clock precision.
- **📅 Alarm Management**: Easily set and toggle all 5 watch alarms.
- **🔔 Reminders**: Configure and name your watch reminders/events.
- **⚙️ Watch Settings**: Adjust illumination, sound, and display options.
- **🎨 Modern UI**: Material Design 3 interface with dynamic adaptation to your watch model.
- **🔋 Battery Monitoring**: View your watch's battery level at a glance.
- **🔌 Zero Install**: No accounts, no tracking, and no app store downloads.

## 📱 How to Use

### 1. Check Browser Compatibility
To use this application, your browser must support **[Web Bluetooth](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API)**.
- **Desktop:** Chrome, Edge, or Opera (Windows, macOS, Linux).
- **Android:** Chrome.
- **iOS/iPhone:** Use **Bluefy** or **WebBLE** from the App Store.
- *Note: Safari and Firefox do not currently support Bluetooth syncing.*

### 2. Quick Setup
1. **Enable Bluetooth**: Ensure Bluetooth and Location Services (on Android/Windows) are ON.
2. **Enable Flags (Optional)**: If Bluetooth isn't detected, navigate to `chrome://flags`, search for **#web-bluetooth**, set to **Enabled**, and restart.
3. **Connect**: Click **"Pair Watch"** in the app and select your G-Shock from the list.

### 3. Watch Connection Modes
How you initiate the connection on your watch determines what the app does:
- **Long-press Lower Left Button (Mode)**: Full Connection. The app will navigate to the main dashboard, allowing you to manage alarms, reminders, and settings.
- **Short-press Lower Right Button**: Quick Sync. The app will simply synchronize the time and update the battery status without leaving the pairing screen.

## ⚠️ Limitations
- **Manual Pairing Only**: Browser security requires an explicit user gesture (a button click) to initiate a Bluetooth connection. The app **cannot automatically sync** in the background.

## 🔒 Privacy & Security
This application is **strictly private**. 
- **No data is ever sent to a server.** 
- All communication happens directly between your browser and your watch. 
- Your personal settings are never tracked or stored.

---

## 🛠 Self-Hosting & Development

### Local Development
```bash
npm install
npm run dev
```

## 🎨 Styling & Design
This project uses a dual-styling approach to leverage the best of two worlds:
- **MUI (Material UI)**: Used for functional components (Dialogs, Buttons, Typography) to ensure a consistent Material 3 experience.
- **Tailwind CSS**: Used for layout, spacing, and micro-styling via utility classes.

### Design Tokens (Sync)
Both systems are synchronized using **CSS Variables** defined in `src/styles/globals.css`. 
- **Dark Mode**: Supports system-level dark mode automatically via `prefers-color-scheme`. 
- **Theming**: The app uses a custom "Warm Brown/Peach" Material 3 theme matching the aesthetic of official G-Shock applications.

### Production Deployment
```bash
npm install
npm run build
npm start
```

### 🍓 Raspberry Pi (Automated)
We provide scripts for automated deployment to a Raspberry Pi:
1. Configure `RPI_USER` and `RPI_HOST` in `deploy-rpi.sh`.
2. Run `./deploy-rpi.sh` from your local machine.
3. Run `./setup-rpi.sh` on the Pi to configure the systemd service.

### Documentation
- **[QUICK-START.md](./QUICK-START.md)** - Step-by-step setup guide.
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - In-depth technical reference.
- **[DEPLOYMENT-SUMMARY.md](./DEPLOYMENT-SUMMARY.md)** - Quick 3-step overview.

---

## ⌚ Supported Watches
The application supports 19+ G-Shock models, including:
- **GA series** (Classic, Basic)
- **GW series** (Radio-controlled, Solar)
- **DW series** (Digital)
- **GMW series** (Module)
- And many more with intelligent capability detection.

