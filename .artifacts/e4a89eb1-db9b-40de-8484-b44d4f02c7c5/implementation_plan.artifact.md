# Implementation Plan - Rename Raspberry Pi to Server

This plan outlines the steps to rename all references to "Raspberry Pi" (and its variations like RPi) to a generic "Server" throughout the project, including filenames and contents.

## User Review Required

> [!IMPORTANT]
> This change updates script filenames and internal variable names (e.g., `RPI_USER` -> `SERVER_USER`). Any external automation or manual workflows relying on these names will need to be updated.

## Proposed Changes

### Files to Rename
- No further renames are needed as `deploy.sh` and `setup-server.sh` already use generic or near-generic names, but I will ensure they are fully generic in content.

### Content Updates
The following terms will be replaced globally (with appropriate case matching):
- "Raspberry Pi" -> "Server"
- "RPi" -> "Server"
- "raspberry-pi" -> "server"
- "rpi" -> "server" (except where it's part of a path that shouldn't change, but I'll check)
- `RPI_USER` -> `SERVER_USER`
- `RPI_HOST` -> `SERVER_HOST`
- `RPI_PATH` -> `SERVER_PATH`

#### [MODIFY] Scripts
- [deploy.sh](file:///home/izivkov/projects/gshock-smart-sync-webapp/deploy.sh)
- [setup-server.sh](file:///home/izivkov/projects/gshock-smart-sync-webapp/setup-server.sh)
- [check-deploy.sh](file:///home/izivkov/projects/gshock-smart-sync-webapp/check-deploy.sh)
- [monitor.sh](file:///home/izivkov/projects/gshock-smart-sync-webapp/monitor.sh)
- [.gitignore](file:///home/izivkov/projects/gshock-smart-sync-webapp/.gitignore)
- [cloudflared-config.yml](file:///home/izivkov/projects/gshock-smart-sync-webapp/cloudflared-config.yml)

#### [MODIFY] Documentation
- [README.md](file:///home/izivkov/projects/gshock-smart-sync-webapp/README.md)
- [QUICK-START.md](file:///home/izivkov/projects/gshock-smart-sync-webapp/QUICK-START.md)
- [DEPLOYMENT.md](file:///home/izivkov/projects/gshock-smart-sync-webapp/DEPLOYMENT.md)
- [DEPLOYMENT-FILES.txt](file:///home/izivkov/projects/gshock-smart-sync-webapp/DEPLOYMENT-FILES.txt)
- [DEPLOYMENT-SUMMARY.md](file:///home/izivkov/projects/gshock-smart-sync-webapp/DEPLOYMENT-SUMMARY.md)
- [RELEASE_NOTES.md](file:///home/izivkov/projects/gshock-smart-sync-webapp/RELEASE_NOTES.md)
- [DEPLOYMENT-README.md](file:///home/izivkov/projects/gshock-smart-sync-webapp/DEPLOYMENT-README.md)

## Verification Plan

### Automated Tests
- None, but I will run `grep` again after changes to ensure no "Raspberry Pi" or "RPi" references remain in project files.

### Manual Verification
- Verify that scripts still have the correct logic and paths.
- Read through updated documentation to ensure the tone is consistent and references are clear.
