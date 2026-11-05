#!/bin/bash

# G-Shock Smart Sync Webapp - Server Setup Script
# One-time (or as-needed) server configuration: legacy cleanup + Nginx setup.
# Run this manually whenever server-side config needs to change.
# It does NOT touch application files — use deploy.sh for that.
# Usage: ./setup_nginx.sh

set -e

# Configuration
SERVER_USER="${SERVER_USER:-ivo}"
SERVER_HOST="${SERVER_HOST:-192.168.1.100}"
SERVER_PATH="${SERVER_PATH:-/home/${SERVER_USER}/gshock-smart-sync}"
APP_PORT="${APP_PORT:-3002}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}G-Shock Smart Sync Webapp - Server Setup${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Target: ${SERVER_USER}@${SERVER_HOST}"
echo "Installation path: ${SERVER_PATH}"
echo ""

# Step 1: Clean up any old installations on server
echo -e "${YELLOW}[1/3] Cleaning up old installation on server...${NC}"
ssh "${SERVER_USER}@${SERVER_HOST}" "SERVER_PATH='${SERVER_PATH}'; bash -s" <<'SERVERCLEANUP'
    echo "  → Stopping any legacy services..."
    sudo systemctl stop gshock-webapp.service 2>/dev/null || true
    sudo systemctl disable gshock-webapp.service 2>/dev/null || true
    sudo rm -f /etc/systemd/system/gshock-webapp.service 2>/dev/null || true

    echo "  → Removing old build artifacts..."
    [ -d "${SERVER_PATH}/.next" ] && rm -rf "${SERVER_PATH}/.next"
    [ -d "${SERVER_PATH}/node_modules" ] && rm -rf "${SERVER_PATH}/node_modules"
    [ -f "${SERVER_PATH}/server.js" ] && rm -f "${SERVER_PATH}/server.js"

    echo "  ✓ Cleanup complete."
SERVERCLEANUP

# Step 2: Setup Nginx on server
echo -e "${YELLOW}[2/3] Configuring Nginx on server...${NC}"
ssh "${SERVER_USER}@${SERVER_HOST}" "SERVER_PATH='${SERVER_PATH}'; APP_PORT='${APP_PORT}'; bash -s" <<'SERVERSETUP'
    set -e

    echo "  → Installing/Updating Nginx..."
    sudo apt-get update -qq
    sudo apt-get install -y -qq nginx > /dev/null

    echo "  → Configuring Nginx..."
    sudo tee /etc/nginx/conf.d/real-ip-logging.conf > /dev/null << 'LOGCONF'
log_format realip '\$http_cf_connecting_ip - \$remote_user [\$time_local] '
                  '"\$request" \$status \$body_bytes_sent '
                  '"\$http_referer" "\$http_user_agent" '
                  'fwd="\$http_x_forwarded_for"';
LOGCONF
SERVERSETUP

cat > /tmp/gshock-webapp-nginx.conf <<EOF
server {
    listen ${APP_PORT};
    server_name gshock.avmedia.org localhost 127.0.0.1;
    root ${SERVER_PATH};
    index index.html;

    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Prevent Nginx from redirecting to internal port or HTTP when using relative paths
    absolute_redirect off;
    port_in_redirect off;

    access_log /var/log/nginx/access.log realip;

    location /assets/ {
        try_files \$uri =404;
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

scp /tmp/gshock-webapp-nginx.conf "${SERVER_USER}@${SERVER_HOST}:/tmp/gshock-webapp-nginx.conf"
ssh "${SERVER_USER}@${SERVER_HOST}" "SERVER_PATH='${SERVER_PATH}'; APP_PORT='${APP_PORT}'; bash -s" <<'SERVERSETUP2'
    set -e
    sudo install -m 644 /tmp/gshock-webapp-nginx.conf /etc/nginx/sites-available/gshock-webapp
    if grep -Eq '\$\{APP_PORT\}|\$\{SERVER_PATH\}|\$\{APP_PATH\}' /etc/nginx/sites-available/gshock-webapp; then
        echo "ERROR: Nginx config still contains unresolved template variables. Refusing to reload nginx."
        exit 1
    fi
    sudo chmod 755 "$(dirname "${SERVER_PATH}")"
    sudo chmod -R 755 "${SERVER_PATH}"
    sudo ln -sf /etc/nginx/sites-available/gshock-webapp /etc/nginx/sites-enabled/

    echo "  → Testing and Restarting Nginx..."
    sudo nginx -t
    sudo systemctl restart nginx
    sudo systemctl enable nginx > /dev/null 2>&1

    echo "  ✓ Nginx is $(sudo systemctl is-active nginx)"
SERVERSETUP2

# Step 3: Verify
echo -e "${YELLOW}[3/3] Verifying Nginx is serving...${NC}"
sleep 2
if ssh "${SERVER_USER}@${SERVER_HOST}" "curl -s http://localhost:${APP_PORT}/index.html > /dev/null 2>&1"; then
    echo -e "${GREEN}✓ Nginx is responding on port ${APP_PORT}${NC}"
else
    echo -e "${RED}✗ Health check failed. Please check Nginx logs on the server.${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Server Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
