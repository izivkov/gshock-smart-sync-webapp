# Implementation Plan - Change Application Port to 3002

This plan outlines the steps to change the application's production and development port from 3000/3001 to 3002 to avoid conflicts with other applications on the server.

## User Review Required

> [!IMPORTANT]
> This change updates the port used by the web server (Nginx) on the production server and the Vite development server. After applying these changes, you will need to access the app at `http://192.168.1.100:3002` (production) or `http://localhost:3002` (development).

## Proposed Changes

### Deployment Scripts
- **[MODIFY] [deploy.sh](file:///home/izivkov/projects/gshock-smart-sync-webapp/deploy.sh)**: Change `APP_PORT="3000"` to `APP_PORT="3002"`.
- **[MODIFY] [setup-server.sh](file:///home/izivkov/projects/gshock-smart-sync-webapp/setup-server.sh)**: Change `APP_PORT="3000"` to `APP_PORT="3002"`.
- **[MODIFY] [check-deploy.sh](file:///home/izivkov/projects/gshock-smart-sync-webapp/check-deploy.sh)**: Update status check messages and ping tests to use port 3002.

### Configuration Files
- **[MODIFY] [vite.config.ts](file:///home/izivkov/projects/gshock-smart-sync-webapp/vite.config.ts)**: Change `server.port` from 3000 to 3002.
- **[MODIFY] [cloudflared-config.yml](file:///home/izivkov/projects/gshock-smart-sync-webapp/cloudflared-config.yml)**: Change `service: http://localhost:3000` to `service: http://localhost:3002`.
- **[MODIFY] [nginx-local.conf](file:///home/izivkov/projects/gshock-smart-sync-webapp/nginx-local.conf)**: Change `listen 3001;` to `listen 3002;`.

### Documentation
- **[MODIFY] [DEPLOYMENT.md](file:///home/izivkov/projects/gshock-smart-sync-webapp/DEPLOYMENT.md)**: Update all occurrences of port 3000 to 3002.
- **[MODIFY] [QUICK-START.md](file:///home/izivkov/projects/gshock-smart-sync-webapp/QUICK-START.md)**: Update all occurrences of port 3000 to 3002.
- **[MODIFY] [DEPLOYMENT-SUMMARY.md](file:///home/izivkov/projects/gshock-smart-sync-webapp/DEPLOYMENT-SUMMARY.md)**: Update all occurrences of port 3000 to 3002.
- **[MODIFY] [DEPLOYMENT-README.md](file:///home/izivkov/projects/gshock-smart-sync-webapp/DEPLOYMENT-README.md)**: Update all occurrences of port 3000 to 3002.
- **[MODIFY] [DEPLOYMENT-FILES.txt](file:///home/izivkov/projects/gshock-smart-sync-webapp/DEPLOYMENT-FILES.txt)**: Update all occurrences of port 3000 to 3002.

## Verification Plan

### Automated Tests
- Run `./check-deploy.sh` to ensure it correctly identifies port 3002 as the target.

### Manual Verification
- Run `npm run dev` and verify the app is accessible at `http://localhost:3002`.
- Run `./deploy.sh` and verify the app is correctly configured on the server to listen on port 3002.
