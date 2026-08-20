#!/bin/bash

# G-Shock Smart Sync Webapp - Production Deployment Script
# Builds the Vite SPA and syncs it to the server.
# Does NOT touch Nginx or any other server configuration —
# run setup_nginx.sh separately if server config needs to change.
# Usage: ./deploy.sh

set -e

# Configuration
SERVER_USER="ivo"
SERVER_HOST="192.168.1.100"
SERVER_PATH="/home/ivo/gshock-smart-sync"
APP_PORT="3002"

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

# Step 1: Build the Vite application
echo -e "${YELLOW}[1/3] Building Vite application locally...${NC}"

if [ ! -d "node_modules" ] || [ package.json -nt node_modules ]; then
    echo "  → Installing dependencies..."
    npm install
fi

npm run build

# Step 2: Prepare deployment package
echo -e "${YELLOW}[2/3] Preparing Vite bundle...${NC}"
rm -rf deploy-package
mkdir -p deploy-package
cp -r dist/* deploy-package/
echo "  ✓ Bundle size: $(du -sh deploy-package | cut -f1)"

# Step 3: Transfer files to server
echo -e "${YELLOW}[3/3] Syncing files to server...${NC}"
ssh "${SERVER_USER}@${SERVER_HOST}" "mkdir -p ${SERVER_PATH}"
rsync -avz --delete deploy-package/ "${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/"
echo "  ✓ Files transferred."

# Verify
echo ""
echo -e "${YELLOW}Verifying deployment...${NC}"
sleep 1
if ssh "${SERVER_USER}@${SERVER_HOST}" "curl -s http://localhost:${APP_PORT}/index.html > /dev/null 2>&1"; then
    echo -e "${GREEN}✓ Application is live at http://${SERVER_HOST}:${APP_PORT}${NC}"
else
    echo -e "${RED}✗ Health check failed. Nginx config may need attention (try ./setup_nginx.sh).${NC}"
fi

# Cleanup local package
rm -rf deploy-package

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Successful!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
