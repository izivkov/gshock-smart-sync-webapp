# Implementation Plan - Step Counter UI and Mocking

Add a step counter UI component to the `Time` page and implement a mock data source for testing.

## User Review Required

> [!IMPORTANT]
> The Step Counter polling will run every 3 seconds while connected to a watch that supports it (or has mocking enabled). This matches the behavior of the Android app.

## Proposed Changes

### API & Mocking

#### [NEW] [MockStepData.ts](file:///home/izivkov/projects/gshock-smart-sync-webapp/src/api/utils/MockStepData.ts)
- Implement `generateMockStepData()` to return randomized `StepCounterData`.
- Data includes hourly history (144 slots), daily history (14 days), and current day total.

#### [MODIFY] [GShockAPI.ts](file:///home/izivkov/projects/gshock-smart-sync-webapp/src/api/GShockAPI.ts)
- Update `getStepCount()` to return mock data if `watchInfo.hasStepCounterMock` is true.

#### [MODIFY] [WatchInfo.ts](file:///home/izivkov/projects/gshock-smart-sync-webapp/src/api/WatchInfo.ts)
- Set `hasStepCounterMock: true` for the `GENERIC` model to facilitate testing with unsupported watches.

### UI Components

#### [NEW] [StepCounterView.tsx](file:///home/izivkov/projects/gshock-smart-sync-webapp/src/pages/time/StepCounterView.tsx)
- Create a new component using MUI and SVG.
- **Today View**: Arc progress chart showing steps vs 10,000 goal.
- **Hourly View**: Bar chart showing the last 6 ten-minute intervals.
- **Daily View**: Bar chart showing the last 6 days plus today.
- Include a dropdown to switch between views.

### Integration

#### [MODIFY] [Time.page.tsx](file:///home/izivkov/projects/gshock-smart-sync-webapp/src/pages/time/Time.page.tsx)
- Add state for `stepData`.
- Integrate `StepCounterView` into the layout (visible if `hasStepCounter` or `hasStepCounterMock` is true).
- Implement a 3-second polling interval for step data when connected.

## Verification Plan

### Automated Tests
- Verify `generateMockStepData` returns valid structures.

### Manual Verification
- Pair a watch (or use a simulated name that falls back to `GENERIC`).
- Navigate to the Time page.
- Verify the "Steps" card appears.
- Test switching between Today, Hourly, and Daily views.
- Observe the data updating every 3 seconds (when mocked).
