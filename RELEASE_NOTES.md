# Release Notes - G-Shock Smart Sync Webapp — May 20, 2026

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
