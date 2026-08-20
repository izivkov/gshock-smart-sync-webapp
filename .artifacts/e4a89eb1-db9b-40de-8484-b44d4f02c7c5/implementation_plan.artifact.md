# Implementation Plan - Version Bump to v2.0.5

Increment the application version and update release notes to include recent stability, security, and deployment improvements.

## User Review Required

> [!NOTE]
> This will increment the version to **v2.0.5** and update the faint version tag displayed in the app UI.

## Proposed Changes

### [MODIFY] [package.json](file:///home/izivkov/projects/gshock-smart-sync-webapp/package.json)
- Increment `version` from `2.0.4` to `2.0.5`.

### [MODIFY] [RELEASE_NOTES.md](file:///home/izivkov/projects/gshock-smart-sync-webapp/RELEASE_NOTES.md)
- Add section for **v2.0.5**:
    - **Stability Improvements**: Added router guards to prevent "black screens" and refined background fetch logic to eliminate "Mixed Content" warnings on HTTPS.
    - **GATT Reliability**: Implemented a connection stabilization delay for tricky models like GA-B2100, ensuring the GATT server is fully connected before service discovery.
    - **Deployment Overhaul**: Refined `deploy.sh` and added `setup-nginx.sh` for more reliable and standardized server configuration.

## Verification Plan

### Automated Tests
- None required for version bump, but I will check for syntax errors in JSON.

### Manual Verification
- Verify the version tag in the bottom-right corner of the web app after deployment.
