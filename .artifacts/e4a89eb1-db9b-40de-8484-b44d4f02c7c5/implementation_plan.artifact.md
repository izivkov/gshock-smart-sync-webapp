# Build Fixes and Voice Feature Robustness

Resolve TypeScript build errors and improve voice command feature support checks for specific watch models.

## User Review Required

> [!IMPORTANT]
> - `src/pages/components/VoiceAssist.tsx` will be deleted as it is a legacy component causing build errors.
> - `Time.page.tsx` will be thoroughly cleaned of all legacy voice logic that was causing build errors.
> - Voice commands for **Language**, **Date Format**, and **Time Format** will now be validated against watch capabilities (e.g., ABL-100 will now correctly report "Feature not supported" for language settings).

## Proposed Changes

### Clean Up & Build Fixes

#### [DELETE] [VoiceAssist.tsx](file:///home/izivkov/projects/gshock-smart-sync-webapp/src/pages/components/VoiceAssist.tsx)
- Remove the legacy component that causes build errors and conflicts with the new `VoiceControlCard`.

#### [MODIFY] [Time.page.tsx](file:///home/izivkov/projects/gshock-smart-sync-webapp/src/pages/time/Time.page.tsx)
- Remove all legacy voice helper functions (`speak`, `handleSelfCorrection`, `stripFillers`, `parseSpokenNumber`, `parseDurationToSeconds`, `parseTime`, `parseSpokenAlarmTime`, `parseSpokenDate`).
- Remove the `VoiceControlPanel` component and its internal logic.
- Remove all voice-related state and refs.
- Fix MUI `ListItemText` typing issue by using a standard configuration if the build environment is strict.

#### [MODIFY] [VoiceControlCard.tsx](file:///home/izivkov/projects/gshock-smart-sync-webapp/src/pages/time/VoiceControlCard.tsx)
- Fix MUI `ListItemText` `primaryTypographyProps` build error.

### Voice Subsystem Logic (`src/voice`)

#### [MODIFY] [VoiceDispatcher.ts](file:///home/izivkov/projects/gshock-smart-sync-webapp/src/voice/VoiceDispatcher.ts)
- Add capability checks for:
  - **Language**: Check `locale.week_language`.
  - **Date Format**: Check `locale.date_format`.
  - **Time Format**: Check `locale.time_format`.
- Ensure all these settings return "Feature not supported" if the watch model lacks the capability.
- Verify robust cleanup on `Disconnected` event.

## Verification Plan

### Automated Tests
- `npm run build` (or `tsc`) to verify all 7 errors are resolved.

### Manual Verification
1.  **ABL-100 Model**:
    - Say "Set language to Spanish".
    - Confirm response is "Feature not supported".
2.  **Watch Disconnection**:
    - Start a voice interaction.
    - Disconnect the watch.
    - Confirm the interaction stops immediately.
3.  **UI Cleanliness**:
    - Verify the "Time" page no longer contains any voice parsing or speech code.
