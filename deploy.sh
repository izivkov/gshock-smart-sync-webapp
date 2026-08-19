#!/bin/bash

# G-Shock Smart Sync Webapp - Production Deployment Script
# Deploys a Vite SPA production build to a remote server with simple HTTP server
# Usage: ./deploy.sh

set -e

# Configuration
SERVER_USER="ivo"
SERVER_HOST="192.168.1.100"
SERVER_PATH="/home/ivo/gshock-smart-sync"
APP_PORT="3000"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}G-Shock Smart Sync Webapp - Deployment${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Target: ${SERVER_USER}@${SERVER_HOST}"
echo "Installation path: ${SERVER_PATH}"
echo ""

# Step 0: Clean up any old Next.js installations on Server
echo -e "${YELLOW}[0/6] Cleaning up old installation on server...${NC}"
ssh "${SERVER_USER}@${SERVER_HOST}" 'bash -s' << 'SERVERCLEANUP'
    SERVER_PATH="/home/ivo/gshock-smart-sync"
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

# Step 1: Build the Vite application
echo -e "${YELLOW}[1/6] Building Vite application locally...${NC}"

if [ ! -d "node_modules" ] || [ package.json -nt node_modules ]; then
    echo "  → Installing dependencies..."
    npm install
fi

npm run build

# Step 2: Prepare deployment package
echo -e "${YELLOW}[2/6] Preparing Vite bundle...${NC}"
rm -rf deploy-package
mkdir -p deploy-package
cp -r dist/* deploy-package/
echo "  ✓ Bundle size: $(du -sh deploy-package | cut -f1)"

# Step 3: Transfer files to Server
echo -e "${YELLOW}[3/6] Syncing files to server...${NC}"
ssh "${SERVER_USER}@${SERVER_HOST}" "mkdir -p ${SERVER_PATH}"
rsync -avz --delete deploy-package/ "${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/"
echo "  ✓ Files transferred."

# Step 4: Setup Server service
echo -e "${YELLOW}[4/6] Configuring Nginx on server...${NC}"
ssh "${SERVER_USER}@${SERVER_HOST}" 'bash -s' << SERVERSETUP
    set -e
    SERVER_PATH="/home/ivo/gshock-smart-sync"
    APP_PORT="3000"

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

    sudo tee /etc/nginx/sites-available/gshock-webapp > /dev/null << NGINX_CONF
server {
    listen ${APP_PORT};
    server_name gshock.avmedia.org _;
    root ${SERVER_PATH};
    index index.html;
    access_log /var/log/nginx/access.log realip;
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
NGINX_CONF

    sudo chmod 755 /home/ivo
    sudo chmod -R 755 ${SERVER_PATH}
    sudo ln -sf /etc/nginx/sites-available/gshock-webapp /etc/nginx/sites-enabled/

    echo "  → Restarting Nginx..."
    sudo systemctl restart nginx
    sudo systemctl enable nginx > /dev/null 2>&1

    echo "  ✓ Nginx is $(sudo systemctl is-active nginx)"
SERVERSETUP

# Step 5: Verify deployment
echo -e "${YELLOW}[5/6] Verifying deployment...${NC}"
sleep 2
if ssh "${SERVER_USER}@${SERVER_HOST}" "curl -s http://localhost:${APP_PORT}/index.html > /dev/null 2>&1"; then
    echo -e "${GREEN}✓ Application is live at http://${SERVER_HOST}:${APP_PORT}${NC}"
else
    echo -e "${RED}✗ Health check failed. Please check Nginx logs on the server.${NC}"
fi

# Cleanup local package
echo -e "${YELLOW}[6/6] Cleaning up local artifacts...${NC}"
rm -rf deploy-package
echo "  ✓ Done."

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Successful!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
