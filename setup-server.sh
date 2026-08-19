#!/bin/bash

# G-Shock Smart Sync Webapp - Server Setup Script
# Run this to set up a fresh server for hosting the Vite SPA
# Usage: ./setup-server.sh

set -e

APP_PATH="/home/ivo/gshock-smart-sync"
APP_PORT="3000"

echo "=========================================="
echo "G-Shock Smart Sync Webapp - Server Setup"
echo "=========================================="
echo ""

# Step 0: Clean up old Next.js installation
echo "[0/4] Cleaning up old Next.js installation if present..."
if [ -d "${APP_PATH}/.next" ]; then
    rm -rf "${APP_PATH}/.next"
    echo "  ✓ Removed old .next directory"
fi
if [ -f "${APP_PATH}/server.js" ]; then
    rm -f "${APP_PATH}/server.js"
    echo "  ✓ Removed old server.js"
fi

# Step 1: Verify Node.js is installed
echo "[1/4] Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "Warning: Node.js is not installed. Please install Node.js."
else
    echo "  ✓ Node.js already installed: $(node --version)"
fi

# Step 2: Install and Configure Nginx for Vite SPA
echo "[2/4] Setting up Nginx for Vite SPA..."
sudo apt-get update
sudo apt-get install -y nginx

# Configure Nginx main config with custom log format for real IPs behind Cloudflare
sudo tee /etc/nginx/conf.d/real-ip-logging.conf > /dev/null << 'LOGCONF'
# Custom log format that captures real client IP from Cloudflare headers
# Priority: CF-Connecting-IP > X-Forwarded-For > $remote_addr
log_format realip '$http_cf_connecting_ip - $remote_user [$time_local] '
                  '"$request" $status $body_bytes_sent '
                  '"$http_referer" "$http_user_agent" '
                  'fwd="$http_x_forwarded_for"';
LOGCONF

sudo tee /etc/nginx/sites-available/gshock-webapp > /dev/null << EOF
server {
    listen ${APP_PORT};
    server_name _;
    root ${APP_PATH};
    index index.html;

    # Use custom log format that captures real IPs
    access_log /var/log/nginx/access.log realip;

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

echo "Setting permissions so Nginx can read the files..."
sudo chmod 755 /home/ivo
sudo chmod -R 755 ${APP_PATH}

echo "  ✓ Nginx configuration created"

echo "Enabling and restarting Nginx..."
sudo ln -sf /etc/nginx/sites-available/gshock-webapp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx

# Step 3: (Optional) Setup Cloudflare Tunnel for Secure HTTPS
echo "[3/4] Checking for Cloudflare Tunnel (cloudflared)..."
if ! command -v cloudflared &> /dev/null; then
    echo "Installing cloudflared for secure HTTPS tunneling..."
    # Attempting to install the appropriate architecture for linux
    ARCH=$(uname -m)
    if [ "$ARCH" = "x86_64" ]; then
        curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
    elif [ "$ARCH" = "aarch64" ]; then
        curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64.deb
    else
        echo "Unsupported architecture: $ARCH. Skipping cloudflared installation."
        SKIP_CLOUDFLARED=true
    fi

    if [ "$SKIP_CLOUDFLARED" != true ]; then
        sudo dpkg -i cloudflared.deb
        rm cloudflared.deb
        echo "  ✓ Cloudflared installed"
    fi
else
    echo "  ✓ Cloudflared already installed"
fi

# Step 4: Verify
echo "[4/4] Verifying setup..."
sleep 2
if sudo systemctl is-active --quiet nginx; then
    echo ""
    echo "=========================================="
    echo "✓ Setup Complete!"
    echo "=========================================="
    echo ""
    echo "Application is running at: http://$(hostname -I | awk '{print $1}'):${APP_PORT}"
    echo ""
    echo "Useful commands:"
    echo "  View logs:     sudo journalctl -u nginx -f"
    echo "  Stop app:      sudo systemctl stop nginx"
    echo "  Start app:     sudo systemctl start nginx"
    echo "  Restart app:   sudo systemctl restart nginx"
    echo "  Check status:  sudo systemctl status nginx"
    echo ""
    echo "To enable secure HTTPS access (required for Bluetooth WITHOUT browser flags):"
    echo "  Run: cloudflared tunnel --url http://localhost:${APP_PORT}"
    echo ""
else
    echo ""
    echo "=========================================="
    echo "⚠ Setup Complete with Issues"
    echo "=========================================="
    echo ""
    echo "Nginx failed to start. Check logs:"
    echo "  sudo journalctl -u nginx -n 50"
    echo ""
    exit 1
fi
