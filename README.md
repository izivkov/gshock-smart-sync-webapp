# G-Shock Smart Sync Web Application

A web application for managing and synchronizing G-Shock smartwatches via Bluetooth. Built with Next.js and React, featuring Material Design 3 UI.

## Try It Online (Experimental)

You can try the application from our experimental server:

🌐 **[http://192.168.1.100:3000](http://192.168.1.100:3000)** (Experimental - may be shut down if traffic becomes high)

⚠️ **Important:** This is an experimental server running on a Raspberry Pi. Please be aware:
- Service may be intermittently unavailable
- High traffic may cause it to be shut down temporarily or permanently
- For production use, please deploy locally following the instructions below
- No guarantees on uptime or data persistence

## Development

To run the application in development mode:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The application will auto-reload as you make changes to the source files.

## Deploy on Your Own Hardware

For reliable production use, deploy this application to any Linux, Windows, or Mac machine with Node.js:

### Quick Deployment

```bash
# 1. Verify prerequisites
./check-deploy.sh

# 2. Deploy to your server
./deploy-rpi.sh

# 3. Access at http://your-server-ip:3000
```

**Supported Platforms:**
- Linux (Ubuntu, Debian, Raspberry Pi OS, etc.)
- macOS
- Windows (with WSL or native Node.js)

**Prerequisites:**
- Node.js 18+ on development machine
- Node.js 18+ on target server
- rsync and SSH client
- SSH access to target server

**Configuration:**
Edit the deployment script variables to match your server:
```bash
RPI_USER="ivo"                    # SSH username
RPI_HOST="192.168.1.100"          # Server IP or hostname
RPI_PATH="/home/ivo/gshock-smart-sync"  # Installation path
APP_PORT="3000"                   # Application port
```

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
