# AI Onboarding & Project Overview

Welcome! This document is designed to quickly bring AI assistants and LLMs up to speed on the **G-Shock Smart Sync** web application.

## Project Mission
This project is a Next.js-based web application that connects directly to Casio G-Shock Bluetooth watches directly from the browser using the **Web Bluetooth API**. It allows users to read state from the watch, adjust settings, sync time, set alarms, and configure other watch features.

## Tech Stack
*   **Framework**: Next.js 16 (Pages Router, using `.page.tsx` extensions)
*   **Language**: TypeScript (`^5.2.2`)
*   **UI Library**: React 19 (`^19.2.5`), Material-UI (MUI `^9.0.0`), Emotion
*   **Styling**: MUI's `sx` prop, global CSS (`globals.css`), TailwindCSS (`tailwind.config.js` exists but MUI seems dominant). The app uses a custom peach/brown theme (defined in `_app.page.tsx` and custom components).
*   **State & Events**: RxJS (`^7.8.2`) is heavily used as an event bus and for state tracking (see `ProgressEvents.ts`).
*   **Bluetooth**: Native Web Bluetooth API.
*   **Date/Time**: `dayjs`, `luxon`.

## Architecture Overview

### 1. Bluetooth Connection Layer
*   **`src/api/Connection.ts`**: The core class managing the `navigator.bluetooth` lifecycle. It connects to the GATT server, requests services (`CASIO_SERVICE`, `WATCH_FEATURES_SERVICE_UUID`), and manages the reading, writing, and notification characteristics.
*   **`src/api/GShockAPI.ts`**: The high-level facade for watch operations. It exposes methods like `getSettings()`, `setTime()`, `getAlarms()`, etc., hiding the byte-level IO complexity from the UI.
*   **`src/api/WatchInfo.ts`**: Acts as a capability registry. Different G-Shock watch models have different capabilities (e.g., some have auto-light, some have vibration, different battery limit thresholds). This file defines what the currently connected watch supports.

### 2. The I/O Protocol Layer (`src/api/io`)
This directory contains classes responsible for translating high-level JavaScript objects into the specific byte-arrays required by the Casio GATT characteristics, and vice versa. 
*   **Examples**: `AlarmsIO.ts`, `SettingsIO.ts`, `TimeIO.ts`, `EventsIO.ts`.

### 3. Event Bus (`src/api/ProgressEvents.ts`)
The application relies heavily on **RxJS** `BehaviorSubject` and `Observable` to stream events globally.
*   The `progressEvents` instance handles connection state changes ("Connected", "Disconnected"), data loaded events, and UI update requests without requiring deep prop-drilling.
*   `_app.page.tsx` listens to these events to globally manage routing and the `ConnectionContext`.

### 4. UI Layer (`src/pages`)
*   **`_app.page.tsx`**: Sets up MUI Theme, Context (`ConnectionContext`), and route protection (redirects to `/` if not connected to a watch).
*   **`index.page.tsx`**: The landing page and connection entry point.
*   **Feature Pages**:
    *   `/settings`: Device settings configuration (e.g., auto-light, tone, language).
    *   `/alarms`: Alarm configuration.
    *   `/time`: Time synchronization and formatting.
    *   `/reminders` / `/events`: Watch reminders configuration.
*   **`components/`**: Reusable generic components (e.g., `AppButton`, `MainLayout`, `ScreenTitle`).

## Key Patterns and Quirks

1.  **Pages Router**: The application uses the `pages` directory but uses `.page.tsx` as the page extension (configured in `next.config.js` via `pageExtensions`).
2.  **No Server-Side Code**: Because this app requires the browser's native Web Bluetooth API, all core functionality runs on the client. Server-side rendering (SSR) is minimally used or avoided for watch interaction.
3.  **RxJS Event System**: If you need to trigger an update across the app when data from the watch changes, use `progressEvents.onNext("EventName")`.
4.  **MUI vs Tailwind**: While `tailwind.config.js` is present, the UI heavily leans on MUI components (Card, Button, Typography) and `sx` prop styling.
5.  **Watch Abstraction**: Always check `watchInfo` before rendering UI for a feature. Do not assume all G-Shocks support features like "vibrate" or "auto light". (e.g., `watchInfo.vibrate`, `watchInfo.hasAutoLight`).

## How to Proceed with Modifications

*   When adding new watch settings, update `WatchInfo.ts` to reflect model capability, create/modify the corresponding `IO` class in `src/api/io`, add the facade method to `GShockAPI.ts`, and finally bind it in the UI.
*   Ensure that components importing `GShockAPI` check for the `isConnected` state (usually via `ConnectionContext`).
