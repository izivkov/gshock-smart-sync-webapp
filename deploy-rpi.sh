#!/bin/bash

# G-Shock Smart Sync Webapp - Raspberry Pi Production Deployment Script
# Deploys a minimal production version to Raspberry Pi
# Usage: ./deploy-rpi.sh

set -e

# Configuration
RPI_USER="ivo"
RPI_HOST="192.168.1.100"
RPI_PATH="/home/ivo/gshock-smart-sync"
APP_PORT="3000"
PYTHON_API_PORT="5000"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}G-Shock Smart Sync Webapp - RPi Deployment${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Target: ${RPI_USER}@${RPI_HOST}"
echo "Installation path: ${RPI_PATH}"
echo ""

# Step 1: Build the Next.js application
echo -e "${YELLOW}[1/5] Building Next.js application...${NC}"
if [ ! -d "node_modules" ]; then
    npm install
fi
npm run build

# Step 2: Create deployment package
echo -e "${YELLOW}[2/5] Creating deployment package...${NC}"
mkdir -p deploy-package
cd deploy-package

# Copy necessary files
cp -r ../.next .
[ -d "../public" ] && cp -r ../public . || echo "No public directory to copy"
cp ../package.json .
cp ../package-lock.json .
cp ../next.config.js .
cp ../tsconfig.json .
cp ../setup-rpi.sh .

# Create production package.json with only production dependencies
cat > package.json << 'EOF'
{
  "name": "gshock-smart-sync-webapp",
  "version": "1.0.0",
  "description": "G-Shock Smart Sync Webapp",
  "scripts": {
    "start": "next start -p 3000"
  },
  "dependencies": {
    "next": "^16.2.3",
    "react": "^19.2.5",
    "react-dom": "^19.2.5",
    "@mui/material": "^9.0.0",
    "@mui/icons-material": "^9.0.0",
    "@mui/x-date-pickers": "^9.0.0",
    "@emotion/react": "^11.14.0",
    "@emotion/styled": "^11.14.1",
    "dayjs": "^1.11.20",
    "rxjs": "^7.8.2",
    "object-hash": "^3.0.0"
  }
}
EOF

cd ..

# Step 3: Transfer files to Raspberry Pi
echo -e "${YELLOW}[3/5] Transferring files to Raspberry Pi...${NC}"
ssh "${RPI_USER}@${RPI_HOST}" "mkdir -p ${RPI_PATH}"
rsync -avz --delete deploy-package/ "${RPI_USER}@${RPI_HOST}:${RPI_PATH}/"

# Step 4: Setup Raspberry Pi environment
echo -e "${YELLOW}[4/5] Setting up Raspberry Pi environment...${NC}"
ssh "${RPI_USER}@${RPI_HOST}" << 'RPISETUP'
#!/bin/bash
set -e

RPI_PATH="/home/ivo/gshock-smart-sync"
APP_PORT="3000"

echo "Installing Node.js dependencies..."
cd ${RPI_PATH}
npm install --production

# Create systemd service for the web app
echo "Creating systemd service..."
sudo tee /etc/systemd/system/gshock-webapp.service > /dev/null << 'SERVICE'
[Unit]
Description=G-Shock Smart Sync Webapp
After=network.target

[Service]
Type=simple
User=ivo
WorkingDirectory=/home/ivo/gshock-smart-sync
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
SERVICE

echo "Enabling and starting service..."
sudo systemctl daemon-reload
sudo systemctl enable gshock-webapp.service
sudo systemctl restart gshock-webapp.service

echo "Checking service status..."
sudo systemctl status gshock-webapp.service --no-pager

RPISETUP

# Step 5: Verify deployment
echo -e "${YELLOW}[5/5] Verifying deployment...${NC}"
echo ""
echo "Waiting for application to start..."
sleep 5

if ssh "${RPI_USER}@${RPI_HOST}" "curl -s http://localhost:${APP_PORT} > /dev/null"; then
    echo -e "${GREEN}✓ Application is running successfully!${NC}"
else
    echo -e "${YELLOW}⚠ Could not verify application. Check logs with: ssh ${RPI_USER}@${RPI_HOST} 'sudo journalctl -u gshock-webapp -f'${NC}"
fi

# Cleanup
rm -rf deploy-package

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Application URL: http://${RPI_HOST}:${APP_PORT}"
echo ""
echo "Useful commands:"
echo "  View logs:     ssh ${RPI_USER}@${RPI_HOST} 'sudo journalctl -u gshock-webapp -f'"
echo "  Stop app:      ssh ${RPI_USER}@${RPI_HOST} 'sudo systemctl stop gshock-webapp'"
echo "  Start app:     ssh ${RPI_USER}@${RPI_HOST} 'sudo systemctl start gshock-webapp'"
echo "  Restart app:   ssh ${RPI_USER}@${RPI_HOST} 'sudo systemctl restart gshock-webapp'"
echo "  SSH to RPi:    ssh ${RPI_USER}@${RPI_HOST}"
echo ""
