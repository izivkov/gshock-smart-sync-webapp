# Implementation Plan - Fix GATT Concurrency Issues

This plan addresses the `NetworkError: GATT operation already in progress` error by ensuring all BLE write operations are correctly awaited throughout the application layers.

## User Review Required

> [!IMPORTANT]
> This change modifies the `WatchProtocol` interface and several IO handlers to be asynchronous. Any custom protocol implementations or direct IO calls will need to be updated to `await` these operations.

## Proposed Changes

### 1. Protocol Layer
#### [MODIFY] [WatchProtocol.ts](file:///home/izivkov/projects/gshock-smart-sync-webapp/src/api/protocols/WatchProtocol.ts)
- Update `setTimer`, `setAlarms`, and `setSettings` to return `Promise<void>`.

#### [MODIFY] [StandardProtocol.ts](file:///home/izivkov/projects/gshock-smart-sync-webapp/src/api/protocols/StandardProtocol.ts)
- Mark `setTimer`, `setAlarms`, and `setSettings` as `async`.
- `await` all internal IO calls (`TimerIO.set`, `AlarmsIO.set`, `SettingsIO.set`, `TimeAdjustmentIO.set`).

### 2. IO Layer
#### [MODIFY] [TimerIO.ts](file:///home/izivkov/projects/gshock-smart-sync-webapp/src/api/io/TimerIO.ts)
- Update `set` and `sendToWatchSet` to be `async` and `await` the `CasioIO.writeCmd` call.

### 3. API Layer
#### [MODIFY] [GShockAPI.ts](file:///home/izivkov/projects/gshock-smart-sync-webapp/src/api/GShockAPI.ts)
- `await` all calls to `watchInfo.protocol!.setTimer`, `setAlarms`, and `setSettings`.

### 4. UI Layer
#### [MODIFY] [Settings.page.tsx](file:///home/izivkov/projects/gshock-smart-sync-webapp/src/pages/settings/Settings.page.tsx)
- `await GShockAPI.setSettings(settings)` in the `onSave` handler.

#### [MODIFY] [Alarms.page.tsx](file:///home/izivkov/projects/gshock-smart-sync-webapp/src/pages/alarms/Alarms.page.tsx)
- `await GShockAPI.setAlarms(alarms)` in the `onSave` handler.

#### [MODIFY] [Time.page.tsx](file:///home/izivkov/projects/gshock-smart-sync-webapp/src/pages/time/Time.page.tsx)
- `await GShockAPI.setTimer(totalSeconds)` in the timer update handler.

## Verification Plan

### Automated Tests
- Run `npx tsc --noEmit` to verify type safety and that all `async` methods are correctly used.

### Manual Verification
- Test sending settings to the watch and verify that the `GATT operation already in progress` error no longer appears in the console.
- Test setting alarms and the timer.
