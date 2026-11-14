# Release Notes - G-Shock Smart Sync Webapp

## Unreleased - Session Architecture
*   **Sessions (aligned with the Android app)**: Each watch connection is now a `Session` managed by a singleton `SessionManager`, as in CasioGShockSmartSync. A session is the single source of truth for the connection phase (Connecting, Ready, Closed), the watch name/model/address, and which screens have unsaved changes. A single `SessionEventBridge` is the only subscriber to connection events; components no longer subscribe to them. See `SESSIONS.md` for the full architecture, with diagrams.
*   **Connection Events Match the Kotlin Library**: `Connection` now emits `ConnectionStarted`, `ConnectionSetupComplete`, `ConnectionFailed` and `Disconnect`, replacing `Connected`/`Disconnected`. A failed service or characteristic discovery now releases the link and reports `ConnectionFailed` instead of reporting a connection, and pressing *Pair Watch* while already connected no longer disturbs the live session.
*   **Connection Actions Run Once per Session**: A new `SessionActionRunner` (the equivalent of Android's `ActionRunner`) runs the actions for the button that started the connection (normal, action button, Auto-Time, Find Phone) exactly once when the session becomes Ready, and again whenever the watch requests them. The connection button is read once and fixed for the session.
*   **Send Buttons Enable Only When Something Changed**:
    *   *Send to Watch* on Alarms, Reminders and Settings, *Set Timer* on Time, and *Save* in the Health profile dialog stay disabled until the screen differs from the watch.
    *   Changing a value and changing it back disables the button again. Sending, or re-reading from the watch, also disables it.
    *   Reminders are compared by what is actually written to the watch, so reverting an edit is recognised.
    *   *Set Time* stays enabled (its value keeps changing) but is disabled while the time is being sent.
*   **Unsaved Changes Survive Screen Switches**: Edits are held by the session instead of per-screen state, so switching screens no longer loses them. They are dropped only when the watch disconnects.
*   **Cleanup on Disconnect**: When a session closes, unsaved edits, cached watch data and watch info are cleared automatically. Phone Finder stops ringing and the voice assistant stops listening through the session, instead of listening for connection events themselves.
*   **ABL-100 Set Time Fix**: Setting the time on the ABL-100W no longer fails with a watch error (`FF 81 1F`). The app was sending the world-cities register, which this model doesn't implement, because the world-cities capability was read from the wrong flag. `WatchInfo` now has a single `hasWorldCities` flag, as in the Kotlin API, and models without world cities but with a home time (GBD, EQB) write the home time instead.
*   **Exercise Profile Save Fix**: Saving the exercise profile failed with "Action SetExerciseProfileAction not found" because the action was never registered; it now is.
*   **Alarms**: The Signal (hourly chime) switch no longer writes to the watch immediately; it is sent with the other changes. Editing an alarm now keeps its existing name and one-time flag.
*   **Fewer Pop-ups**: Success snackbars for completed actions were removed; errors are still reported.
*   **Build Fixes**: Removed accidental `repl` and `constants` imports that stopped `tsc` from compiling, added a missing `GShockAPI` import on the Health page, and removed the duplicate `src/api/session` directory.

## v2.1.0
*   **Voice UI Architecture**: Completed a major architectural refactor of the voice subsystem into a dedicated, modular `/src/voice` directory. This aligns the web app with the native Kotlin implementation's orthogonal structure.
*   **Smart Reminder Wizard**: Implemented a multi-turn conversational flow for reminders (Title -> Date -> Repeat) with state-aware microphone synchronization.
*   **Performance Optimization**: Introduced a "Smart Write" strategy for reminders, reducing the delay from command to confirmation by over 70% (from ~5.5s to ~1.5s).
*   **Hardware Awareness**: The voice system now strictly verifies watch capabilities (Reminders, Language, Date/Time formats) and gracefully informs the user if a feature is unsupported.
*   **New Voice Commands**:
    *   **Bulk Alarms**: Added "Clear alarms", "Reset alarms" (to 12:00 AM), and "Disable alarms" (preserving time).
    *   **Settings**: Added "Set light duration to long/short".
*   **Robustness**:
    *   Added automatic voice interaction termination upon watch disconnection.
    *   Implemented "Verbose" mode toggle with a silent 'ding' alternative, persisted in `localStorage`.
    *   Enhanced the natural language parser with self-correction and filler-word removal logic.
*   **Stability**: Resolved several circular dependency issues and TypeScript build errors across the project.

## v2.0.5
*   **Voice Command Fix**: The "Set language to..." voice command now correctly checks watch capability before executing. Previously it accepted the command on watches without Week Language support (e.g. ABL-100), silently doing nothing instead of telling the user the feature isn't supported.
*   **Security Patches**: Resolved all remaining npm audit findings (`browserslist`, `fast-uri`, `js-yaml`, `@humanfs/node`, `baseline-browser-mapping`) via non-breaking updates.
*   **Dependency Hygiene**: Removed the stale `pnpm-lock.yaml`, which hadn't been regenerated since the Next.js-to-Vite migration and was resolving long-outdated, vulnerable transitive dependencies. `npm`/`package-lock.json` is now the single source of truth for dependency resolution, and `npm audit` reports 0 vulnerabilities.

## v2.0.4
*   **Robust Navigation**: Centralized connection and disconnection event handling in the root component, ensuring consistent redirects to the Time screen and back to Home.
*   **Router Stability**: Implemented navigation guards to prevent rapid-fire transitions and resolve "black screen" issues during watch initialization.
*   **State Cleanup**: Fixed an issue where watch metadata remained after disconnection by implementing mandatory state resets on signal loss.
*   **Bluetooth Robustness**: Added connection stabilization checks to handle immediate GATT disconnections common with some watch models.

## v2.0.3
*   **Port Conflict Resolution**: Moved the application and development server to **port 3002** to avoid common conflicts with other local services.
*   **Security Patches**: Resolved high-severity vulnerabilities by upgrading `vite` to `v6.4.3` and applying strategic dependency overrides for `esbuild` and `postcss`.
*   **Deployment Reliability**: Improved `deploy.sh` and `setup-server.sh` to handle remote terminal allocation and `sudo` password prompts more gracefully.
*   **SSH Connectivity**: Enhanced the pre-deployment checklist to verify SSH accessibility with configurable timeouts.

## v2.0.2
*   **Model Consolidation**: Organized all shared data objects (Alarms, Settings, StepCounterData, Mocks) into the `src/model/` directory for better architectural alignment with the GShockAPI ecosystem.
*   **GATT Concurrency Fix**: Implemented full asynchronous awaiting for Bluetooth write operations, resolving "GATT operation already in progress" errors during watch configuration.
*   **Code Cleanup**: Removed redundant model definitions and streamlined imports across the application.

## v2.0.1
*   **Renamed Deployment References**: Updated all scripts, variable names, and documentation to refer to a generic "Server" instead of "Raspberry Pi". This makes the deployment infrastructure more suitable for VPS and other remote hosting environments.
*   **Library Alignment**: Synced with the latest Kotlin `GShockAPI` standards, including improved protocol dispatching and functional IO separation.
*   **Step Counter**: Introduced an interactive Step Counter UI on the Time page with support for Today, Hourly, and Daily views.
*   **Mocking**: Added `hasStepCounterMock` feature for the `GENERIC` model to facilitate UI testing.
*   **UI Version Display**: Added a small version tag at the bottom-right of the screen for easier identification of the running version.

## ✨ Vite Migration & Optimizations
*   **Performance**: Successfully migrated the entire application from Next.js to Vite, resulting in significantly faster build times and a lighter production bundle.
*   **Code Splitting**: Implemented `React.lazy` and `Suspense` for all router pages, reducing the main Javascript bundle size by over 50% (from ~828 KB to ~391 KB).
*   **PWA Ready**: Integrated `vite-plugin-pwa` to automatically cache all static assets via a Service Worker, allowing the application to boot instantly from local cache without network overhead.
*   **Image Optimization**: Converted heavy PNG watch assets to highly optimized WebP formats, drastically improving visual load times.
*   **Routing**: Implemented a lightweight, custom component-based SPA router replacing Next.js file-based routing.
*   **Deployment**: Updated all deployment scripts (`deploy.sh`, `setup-server.sh`) to use **Nginx** as the production web server, replacing `npx serve`. Nginx provides robust SPA fallback routing, proper MIME types, and runs as a managed `systemd` service. Cleaned up legacy `.next` artifacts and removed unnecessary `node_modules`/`package.json` from the deployed bundle.

## ✨ New in This Release

### 🔒 Reminder Title Input Validation
*   **Character Restriction**: The Reminder title input field now strictly validates input in real-time, blocking any characters outside the G-Shock watch's supported ASCII character set (`A-Z`, `a-z`, `0-9`, and standard symbols). Non-ASCII characters (e.g. Japanese, Chinese, emoji) are silently filtered as you type.

### 📊 Activity Report Improvements
*   **Nginx Log Support**: Updated `analyze_logs.py` to natively parse the standard **Nginx combined log format**, in addition to the existing custom `[ACCESS]` format. The script now automatically detects which format each log line uses.
*   **Navigation Tracking**: The SPA router now sends silent background `fetch()` requests on page navigation, allowing Nginx to record user activity in its access logs, which is analysed by `analyze_logs.py`.

## ✨ Standardization
*   **Date Libraries**: Standardized date and time management strictly on `dayjs`, completely removing all legacy `luxon` dependencies across the entire codebase to reduce duplicate logic and simplify development.
## ✨ Security & Maintenance

### 🛡️ Critical Security Update
Patched a vulnerability in the underlying Next.js framework ([GHSA-mg66-mrh9-m8jx](https://github.com/advisories/GHSA-mg66-mrh9-m8jx)).
*   **Fix**: Upgraded `next` to version `16.2.6`.
*   **Impact**: Resolves a Denial of Service (DoS) vulnerability via connection exhaustion in applications using Cache Components.
*   **Dependency Sync**: Updated `eslint-config-next` to `16.2.6` to maintain compatibility with the core framework.
*   **Fix**: Resolved Dependabot alert #9 by upgrading `postcss` to `^8.5.10` via overrides to patch an XSS vulnerability via unescaped `</style>` tags.
*   **Fix**: Resolved a Denial of Service (DoS) vulnerability in `brace-expansion` by upgrading to a secure version.

---

## 🚀 Recent Features & Improvements

### 🎨 Dynamic Interface Enhancements
*   **Dynamic Controls**: Introduced smarter UI components that adapt to watch capabilities in real-time.
*   **Styling Refinement**: Completed migration to a clean Material 3 design system by completely removing all Tailwind CSS dependencies, legacy utility classes, and documentation references.

### 🛠 Technical Updates
*   **AI Onboarding**: Added a comprehensive `AI_ONBOARDING.md` guide to assist AI coding agents in understanding the project's architecture, event bus, and design patterns.
*   **Stability**: Resolved several TypeScript compilation errors across the API and UI layers.
*   **Build Optimization**: Refined the development workflow to ensure faster hot-reloading when modifying core Bluetooth logic.

---

## ⌚ About G-Shock Smart Sync Webapp
A lightweight, privacy-focused web tool that lets you manage your G-Shock watch directly from your browser. No accounts, no tracking, and no phone app required.