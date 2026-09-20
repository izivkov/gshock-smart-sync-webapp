# Fix TypeScript Build Errors

Resolve several TypeScript compilation errors across the project caused by missing methods in `GShockAPI` and incorrect imports in page components.

## User Review Required

> [!IMPORTANT]
> This change restores critical "set" methods to `GShockAPI` that were inadvertently removed and fixes missing imports in the Alarms, Reminders, and Settings pages.

## Proposed Changes

### Core API (`src/api`)

#### [MODIFY] [GShockAPI.ts](file:///home/izivkov/projects/gshock-smart-sync-webapp/src/api/GShockAPI.ts)
- Restore missing `set` methods that delegate to `actionsContainer`:
  - `setTimer(timerValue: number)`
  - `setTime(timeZone?: string)`
  - `setAlarms(alarms: Alarm[])`
  - `setEvents(events: any[])`
  - `setSettings(settings: Settings)`
  - `clearStepHistory()`

### Pages (`src/pages`)

#### [MODIFY] [Alarms.page.tsx](file:///home/izivkov/projects/gshock-smart-sync-webapp/src/pages/alarms/Alarms.page.tsx)
- Add missing imports:
  - `actionsContainer` from `@/actions/ActionsContainer`
  - `SetAlarmsAction` from `@/actions/ActionsContainer`

#### [MODIFY] [Reminders.page.tsx](file:///home/izivkov/projects/gshock-smart-sync-webapp/src/pages/reminders/Reminders.page.tsx)
- Add missing imports:
  - `actionsContainer` from `@/actions/ActionsContainer`
  - `SetRemindersAction` from `@/actions/ActionsContainer`

#### [MODIFY] [Settings.page.tsx](file:///home/izivkov/projects/gshock-smart-sync-webapp/src/pages/settings/Settings.page.tsx)
- Add missing imports:
  - `actionsContainer` from `@/actions/ActionsContainer`
  - `SetSettingsAction` from `@/actions/ActionsContainer`

## Verification Plan

### Automated Tests
- Run `npx tsc` to verify that all reported errors are resolved.

### Manual Verification
- Verify that Alarms, Reminders, and Settings can be saved to the watch from their respective pages.
