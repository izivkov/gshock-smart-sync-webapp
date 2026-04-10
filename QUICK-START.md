# G-Shock Smart Sync - Quick Start Guide

## Deployment Overview

The application is ready for production deployment to your Raspberry Pi at **192.168.1.100**. Two deployment methods are provided:

### Method 1: Automated Deployment (Recommended)
Uses `deploy-rpi.sh` to build, package, transfer, and setup everything automatically from your development machine.

### Method 2: Manual Deployment
Transfer files manually and run setup script on the Raspberry Pi.

---

## Method 1: Automated Deployment (Recommended)

### Prerequisites
- Development machine: Node.js, npm, rsync, SSH client
- Raspberry Pi: Raspberry Pi OS Bullseye or newer, SSH enabled, internet access
- Network: Both devices on same network, Raspberry Pi accessible at 192.168.1.100

### Step 1: Prepare Raspberry Pi (One-time setup)
```bash
# SSH into your Raspberry Pi and run these commands:
ssh [USERNAME]@[IP of your server]

# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install Node.js 18 (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Exit SSH
exit
```

### Step 2: Deploy from Development Machine
```bash
# From project root
chmod +x deploy-rpi.sh
./deploy-rpi.sh
```

The script will:
1. Build the Next.js application
2. Create minimal deployment package
3. Transfer files to Raspberry Pi via rsync
4. Setup systemd service for auto-start
5. Verify application is running

### Step 3: Access the Application
Open browser and navigate to:
```
http://192.168.1.100:3000
```

---

## Method 2: Manual Deployment

### Step 1: Build the Application
```bash
npm install
npm run build
```

### Step 2: Create Deployment Package
```bash
# Create minimal package with only production files
mkdir -p deploy-package
cp -r out/ package.json deploy-package/
cd deploy-package
npm install --production
cd ..
```

### Step 3: Transfer to Raspberry Pi
```bash
# From development machine
rsync -avz --delete deploy-package/ [USERNAME]@[IP of your server]:/home/[USERNAME]/gshock-smart-sync/
```

### Step 4: Setup on Raspberry Pi
```bash
# SSH into Raspberry Pi
ssh [USERNAME]@[IP of your server]

# Download and run setup script
cd ~
curl -fsSL https://raw.githubusercontent.com/your-repo/setup-rpi.sh -o setup-rpi.sh
chmod +x setup-rpi.sh
./setup-rpi.sh

# Or manually:
chmod +x /home/[USERNAME]/gshock-smart-sync/setup-rpi.sh
/home/[USERNAME]/gshock-smart-sync/setup-rpi.sh
```

### Step 5: Access the Application
```
http://192.168.1.100:3000
```

---

## Systemd Service Management

After deployment, the app runs as a systemd service `gshock-webapp`.

### View Service Status
```bash
ssh [USERNAME]@[IP of your server] 'sudo systemctl status gshock-webapp'
```

### View Application Logs (Real-time)
```bash
ssh [USERNAME]@[IP of your server] 'sudo journalctl -u gshock-webapp -f'
```

### View Last 50 Log Lines
```bash
ssh [USERNAME]@[IP of your server] 'sudo journalctl -u gshock-webapp -n 50'
```

### Stop Application
```bash
ssh [USERNAME]@[IP of your server] 'sudo systemctl stop gshock-webapp'
```

### Start Application
```bash
ssh [USERNAME]@[IP of your server] 'sudo systemctl start gshock-webapp'
```

### Restart Application
```bash
ssh [USERNAME]@[IP of your server] 'sudo systemctl restart gshock-webapp'
```

### Check Service Logs on Startup Failure
If the service fails to start, check for errors:
```bash
ssh [USERNAME]@[IP of your server] 'sudo systemctl status gshock-webapp'
ssh [USERNAME]@[IP of your server] 'sudo journalctl -u gshock-webapp -n 100'
```

---

## Troubleshooting

### Cannot Connect to http://192.168.1.100:3000

**Check if service is running:**
```bash
ssh [USERNAME]@[IP of your server] 'sudo systemctl status gshock-webapp'
```

**Check if port 3000 is listening:**
```bash
ssh [USERNAME]@[IP of your server] 'sudo netstat -tlnp | grep 3000'
```

**Check application logs:**
```bash
ssh [USERNAME]@[IP of your server] 'sudo journalctl -u gshock-webapp -n 100'
```

### Out of Memory Errors

Raspberry Pi may have limited RAM. Check and create swap:
```bash
ssh [USERNAME]@[IP of your server] << 'EOF'
# Check current memory
free -h

# Check if swap exists
swapon --show

# If no swap, create 1GB swap file
sudo dphys-swapfile swapoff
echo "CONF_SWAPSIZE=1024" | sudo tee /etc/dphys-swapfile
sudo dphys-swapfile setup
sudo dphys-swapfile swapon
EOF
```

### SSH Connection Issues

**Verify SSH is enabled:**
```bash
# On Raspberry Pi terminal
sudo systemctl status ssh
sudo systemctl enable ssh
```

**Test SSH connection:**
```bash
ssh -v [USERNAME]@[IP of your server]
```

### Application Crashes Immediately

Check if Node.js is installed:
```bash
ssh [USERNAME]@[IP of your server] 'node --version'
```

If not, reinstall Node.js as shown in "Prepare Raspberry Pi" section.

---

## Updating the Application

To deploy a new version:

### Option 1: Full Redeploy
```bash
# From development machine
./deploy-rpi.sh
```

### Option 2: Quick Update
```bash
# For code-only changes (no build changes)
rsync -avz --delete out/ [USERNAME]@[IP of your server]:/home/[USERNAME]/gshock-smart-sync/out/
ssh [USERNAME]@[IP of your server] 'sudo systemctl restart gshock-webapp'
```

---

## Performance Optimization

### For Raspberry Pi Zero / Pi 3B (Limited RAM)

**Increase swap:**
```bash
ssh [USERNAME]@[IP of your server] << 'EOF'
echo "CONF_SWAPSIZE=2048" | sudo tee /etc/dphys-swapfile
sudo dphys-swapfile setup
sudo dphys-swapfile swapon
EOF
```

**Monitor resource usage:**
```bash
ssh [USERNAME]@[IP of your server] 'top'
```

**Enable Node.js heap size limiting:**
```bash
ssh [USERNAME]@[IP of your server] << 'EOF'
sudo sed -i 's/ExecStart=/ExecStart=NODE_OPTIONS=--max-old-space-size=256 /' /etc/systemd/system/gshock-webapp.service
sudo systemctl daemon-reload
sudo systemctl restart gshock-webapp
EOF
```

### For Raspberry Pi 4B / Pi 5 (Better Performance)

**Use default settings** - No optimization needed. Service will auto-restart on failure.

---

## Backup and Recovery

### Backup Application
```bash
# On Raspberry Pi
ssh [USERNAME]@[IP of your server] << 'EOF'
tar czf ~/gshock-backup-$(date +%Y%m%d-%H%M%S).tar.gz /home/[USERNAME]/gshock-smart-sync
EOF

# Download backup to dev machine
scp [USERNAME]@[IP of your server]:~/gshock-backup-*.tar.gz ./backups/
```

### Restore from Backup
```bash
# Upload backup
scp ./backups/gshock-backup-YYYYMMDD-HHMMSS.tar.gz [USERNAME]@[IP of your server]:~/

# Restore on Raspberry Pi
ssh [USERNAME]@[IP of your server] << 'EOF'
sudo systemctl stop gshock-webapp
sudo rm -rf /home/[USERNAME]/gshock-smart-sync
tar xzf ~/gshock-backup-YYYYMMDD-HHMMSS.tar.gz -C /
sudo systemctl start gshock-webapp
EOF
```

---

## File Locations on Raspberry Pi

```
/home/[USERNAME]/gshock-smart-sync/          - Application root
├── out/                               - Built Next.js static files
├── public/                            - Static assets
├── package.json                       - Dependencies
├── package-lock.json                  - Lock file
└── node_modules/                      - Installed packages

/etc/systemd/system/gshock-webapp.service  - Systemd service definition
/var/log/gshock-webapp/                    - Application logs (via journalctl)
```

---

## Uninstall

To remove the application from Raspberry Pi:

```bash
ssh [USERNAME]@[IP of your server] << 'EOF'
# Stop service
sudo systemctl stop gshock-webapp
sudo systemctl disable gshock-webapp

# Remove service file
sudo rm /etc/systemd/system/gshock-webapp.service
sudo systemctl daemon-reload

# Remove application directory
rm -rf ~/gshock-smart-sync

# Optional: View what would be deleted
# rm -rf ~/.npm   # Only if you want to remove global npm cache
EOF
```

---

## Support

If you encounter issues:

1. **Check logs first:**
   ```bash
   ssh [USERNAME]@[IP of your server] 'sudo journalctl -u gshock-webapp -n 100'
   ```

2. **Verify all prerequisites are met** (Node.js 18+, SSH, rsync)

3. **Test SSH connection independently:**
   ```bash
   ssh [USERNAME]@[IP of your server] 'uname -a'
   ```

4. **Ensure network connectivity:**
   ```bash
   ping [IP of your server]
   ```

5. **Check Raspberry Pi resource availability:**
   ```bash
   ssh [USERNAME]@[IP of your server] 'free -h && df -h'
   ```
