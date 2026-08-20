# Implementation Plan - Robust Navigation and State Management

Address navigation inconsistencies and reliability issues during watch connection and disconnection by centralizing event handling in the root `App` component.

## User Review Required

> [!IMPORTANT]
> This change moves the primary navigation logic (auto-switching to the Time screen on connect) from the Home page to the root `App` component. This ensures that the app always reacts to connection events regardless of which screen is currently visible.

## Proposed Changes

### [MODIFY] [App.tsx](file:///home/izivkov/projects/gshock-smart-sync-webapp/src/App.tsx)
- Centralize all `progressEvents` listeners:
    - `Connected`: Set `isConnected` to true.
    - `Disconnected`: Set `isConnected` to false, call `watchInfo.reset()`, and navigate to `/`.
    - `WatchInitializationCompleted`: Perform intelligent navigation (Phone Find, Time Sync, or go to Time screen).
- Remove the existing `useEffect` for route protection as it will be handled more predictably by the `Disconnected` event.

### [MODIFY] [index.page.tsx](file:///home/izivkov/projects/gshock-smart-sync-webapp/src/pages/index.page.tsx)
- Remove the `progressEvents.runEventActions("Home", actions)` block and all redundant navigation logic.
- Keep only UI-specific logic.

### [MODIFY] [router.tsx](file:///home/izivkov/projects/gshock-smart-sync-webapp/src/utils/router.tsx)
- Add a small delay/guard in `push` to prevent rapid consecutive navigations from corrupting the state.

## Verification Plan

### Automated Tests
- Run `npx tsc --noEmit` to ensure no broken references.

### Manual Verification
- **Test Connection**: Verify that connecting a watch consistently takes the user to the Time screen.
- **Test Disconnection**: Verify that turning off Bluetooth or disconnecting the watch always returns the user to the Home screen and clears the watch name.
- **Test Phone Finder**: Verify that the Phone Finder still triggers if the watch initiates it.
- **Verify No Black Screen**: Repeatedly connect/disconnect to ensure the router state remains stable.
