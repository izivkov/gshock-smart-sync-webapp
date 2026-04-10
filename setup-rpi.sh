#!/bin/bash

# G-Shock Smart Sync - Raspberry Pi Setup Script
# Run this on the Raspberry Pi after deploying files
# Usage: ./setup-rpi.sh

set -e

APP_PATH="/home/ivo/gshock-smart-sync"
APP_PORT="3000"

echo "=========================================="
echo "G-Shock Smart Sync - RPi Setup"
echo "=========================================="
echo ""

# Check if running on Raspberry Pi
if [ ! -f /etc/os-release ] || ! grep -q "Raspberry Pi" /etc/os-release 2>/dev/null; then
    echo "Warning: This script is intended for Raspberry Pi OS"
fi

# Step 1: Install Node.js if needed
echo "[1/4] Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "Node.js already installed: $(node --version)"
fi

# Step 2: Install application dependencies
echo "[2/5] Installing application dependencies..."
cd "${APP_PATH}"
npm install --production

# Step 3: Create systemd service
echo "[3/5] Setting up systemd service..."
sudo tee /etc/systemd/system/gshock-webapp.service > /dev/null << EOF
[Unit]
Description=G-Shock Smart Sync Web Application
After=network.target

[Service]
Type=simple
User=${SUDO_USER:-ivo}
WorkingDirectory=${APP_PATH}
ExecStart=$(which node) $(which npm) start
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal
Environment="NODE_ENV=production"

[Install]
WantedBy=multi-user.target
EOF

echo "Enabling systemd service..."
sudo systemctl daemon-reload
sudo systemctl enable gshock-webapp.service

# Step 4: Start the service
echo "[4/5] Starting application..."
sudo systemctl restart gshock-webapp.service

# Step 5: (Optional) Setup Cloudflare Tunnel for Secure HTTPS
echo "[5/5] Checking for Cloudflare Tunnel (cloudflared)..."
if ! command -v cloudflared &> /dev/null; then
    echo "Installing cloudflared..."
    # Note: Using arm64 for RPi 4/5. Change to arm for older models if needed.
    curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64.deb
    sudo dpkg -i cloudflared.deb
    rm cloudflared.deb
fi

echo ""
echo "To enable secure HTTPS access (required for Bluetooth WITHOUT browser flags):"
echo "1. Run: cloudflared tunnel --url http://localhost:${APP_PORT}"
echo "2. Copy the generated 'https://...trycloudflare.com' link"
echo ""

# Verify
sleep 3
if sudo systemctl is-active --quiet gshock-webapp.service; then
    echo ""
    echo "=========================================="
    echo "✓ Setup Complete!"
    echo "=========================================="
    echo ""
    echo "Application is running at: http://$(hostname -I | awk '{print $1}'):${APP_PORT}"
    echo ""
    echo "Useful commands:"
    echo "  View logs:     sudo journalctl -u gshock-webapp -f"
    echo "  Stop app:      sudo systemctl stop gshock-webapp"
    echo "  Start app:     sudo systemctl start gshock-webapp"
    echo "  Restart app:   sudo systemctl restart gshock-webapp"
    echo "  Check status:  sudo systemctl status gshock-webapp"
    echo ""
else
    echo ""
    echo "=========================================="
    echo "⚠ Setup Complete with Issues"
    echo "=========================================="
    echo ""
    echo "Service failed to start. Check logs:"
    echo "  sudo journalctl -u gshock-webapp -n 50"
    echo ""
    exit 1
fi
