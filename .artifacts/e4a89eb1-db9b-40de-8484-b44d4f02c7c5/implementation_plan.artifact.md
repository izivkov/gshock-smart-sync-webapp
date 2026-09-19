# Resolve Stale Version Display After Deployment

Address the issue where the application continues to show an old version (v2.0.5) even after a successful deployment of v2.1.0. This is typically caused by aggressive caching at the Cloudflare edge, the local Service Worker, or the Nginx server.

## User Review Required

> [!WARNING]
> To see the new version immediately after these changes, you will likely need to **Purge Cache** in your Cloudflare dashboard and perform a **Hard Refresh** (Ctrl+F5 / Cmd+Shift+R) in your browser.

## Proposed Changes

### Server Configuration

#### [MODIFY] [setup-nginx.sh](file:///home/izivkov/projects/gshock-smart-sync-webapp/setup-nginx.sh)
- Update the Nginx configuration to explicitly disable caching for critical entry files: `index.html` and `sw.js`.
- This ensures that browsers and proxies always check the server for a new version of the app logic.
- Assets like JS and CSS in the `assets/` folder remain cacheable as they are hashed by Vite.

### Deployment Process

#### [MODIFY] [deploy.sh](file:///home/izivkov/projects/gshock-smart-sync-webapp/deploy.sh)
- Add a post-deployment reminder to the user to purge the Cloudflare cache.
- (Optional) Provide a command/snippet if you want to automate this via the Cloudflare API in the future.

### Application Logic (PWA)

#### [MODIFY] [vite.config.ts](file:///home/izivkov/projects/gshock-smart-sync-webapp/vite.config.ts)
- Switch `registerType` from `autoUpdate` to `prompt`.
- While `autoUpdate` is convenient, `prompt` (combined with a UI notification) is often more reliable for ensuring users are actually running the latest code, as it forces a clean reload.
- *Wait*: Let's stick with `autoUpdate` for now but fix the server headers first, as that is the most likely culprit for "not seeing the update at all".

## Verification Plan

### Manual Verification
1.  Run `./setup_nginx.sh` to apply new headers on the server.
2.  Purge the cache in the Cloudflare dashboard.
3.  Open `https://gshock.avmedia.org` and check the version in the bottom-right corner.
4.  Verify headers via `curl -I https://gshock.avmedia.org` to ensure `Cache-Control: no-cache` is present for the root document.
