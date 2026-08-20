# Walkthrough - Application Port Changed to 3002

I have updated the entire project to use **port 3002** for both development and production. This avoids the conflict you encountered with port 3001 on your server.

## Key Changes

### 1. Deployment Scripts
- **`deploy.sh`**: Updated `APP_PORT` to `3002`.
- **`setup-server.sh`**: Updated `APP_PORT` to `3002`.
- **`check-deploy.sh`**: Updated the recommended access URL to `http://192.168.1.100:3002`.

### 2. Configuration Files
- **`vite.config.ts`**: Updated the dev server port to `3002`.
- **`cloudflared-config.yml`**: Updated the ingress service to `http://localhost:3002`.
- **`nginx-local.conf`**: Updated the listen port to `3002`.

### 3. Documentation
Updated all occurrences of port `3000` or `3001` to `3002` in:
- `README.md`
- `QUICK-START.md`
- `DEPLOYMENT.md`
- `DEPLOYMENT-SUMMARY.md`
- `DEPLOYMENT-README.md`
- `DEPLOYMENT-FILES.txt`

## Verification
- Confirmed that `check-deploy.sh` now points to port `3002`.
- Verified that all script variables are consistently set to `3002`.

---
> [!IMPORTANT]
> Please run `./deploy.sh` now to update your server configuration. Once complete, your app will be available at **`http://192.168.1.100:3002`**.
