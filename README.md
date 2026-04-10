# G-Shock Smart Sync Web Application

**⚠️ WARNING: This is an EXPERIMENTAL project.** It is currently under active development and may undergo significant changes.

A web application for managing and synchronizing G-Shock smartwatches via Bluetooth. Built with Next.js and React, featuring Material Design 3 UI.

## 🌐 Try It Online

For the best experience (including automatic Bluetooth support), always access the application via **HTTPS**.

🔗 **[https://avmedia.org:3000](https://avmedia.org:3000)** (Static Domain)
🔗 **[https://your-tunnel-name.trycloudflare.com](https://your-tunnel-name.trycloudflare.com)** (Ephemeral Tunnel)
🔗 **[http://avmedia.org:3000](http://avmedia.org:3000)** (HTTP Fallback)

*Note: The application is running on a Raspberry Pi and may be intermittently unavailable. The HTTPS tunnel is recommended for seamless Bluetooth support.*

## 🔒 Privacy & Security

**Your privacy is our priority.** This application runs **strictly in your browser**.
- **No data is sent to our servers.** All communication occurs directly between your browser and your watch via the Web Bluetooth API.
- Your settings, alarms, and reminders are processed locally.
- Use of an HTTPS tunnel (like Cloudflare) ensures that the traffic between your browser and the server is encrypted.

## 🔧 Secure Remote Access (Recommended)

Web Bluetooth requires a **Secure Context** (HTTPS) to function. If you are hosting this application locally and want others to connect easily, we recommend using a **Cloudflare Tunnel**.

### Benefits
*   **Automatic HTTPS**: Cloudflare handles the SSL certificates for you.
*   **No Port Forwarding**: You don't need to open ports on your router.
*   **Bypasses Browser Flags**: Users don't need to configure `chrome://flags` if they access via HTTPS.

### Quick Setup (using `cloudflared`)
1.  **Install `cloudflared`** (included in `setup-rpi.sh`).
2.  **Start a tunnel**:
    ```bash
    cloudflared tunnel --url http://localhost:3000
    ```
3.  **Share the link**: Copy the generated `https://your-unique-name.trycloudflare.com` URL and share it with your users.

---

## ⚙️ Browser Configuration (fallback for HTTP)

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
