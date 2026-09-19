# Voice UI Robustness: Feature Support and Disconnection Handling

Improve the voice subsystem's error handling by adding feature support verification and automatic termination upon watch disconnection.

## User Review Required

> [!IMPORTANT]
> Voice commands that target unsupported features (e.g., reminders on ABL-100) will now be met with a verbal "Feature not supported" message and will terminate immediately.
>
> Ongoing voice interactions (like the reminder wizard) will automatically stop if the watch disconnects during the process.

## Proposed Changes

### Voice Subsystem (`src/voice`)

#### [MODIFY] [VoiceDispatcher.ts](file:///home/izivkov/projects/gshock-smart-sync-webapp/src/voice/VoiceDispatcher.ts)
- **Feature Verification**:
  - In `dispatch()`, before starting the reminder wizard, check `WatchFeatureManager.isFeatureSupported('actions.reminders')`.
  - In `executeCommand()`, check support for specific settings (e.g., `auto light`, `power saving`) before running the action.
  - If a feature is not supported, speak "Feature not supported" and set state to `idle`.
- **Disconnection Handling**:
  - Add a listener for the "Disconnected" event using `progressEvents`.
  - When disconnected, call `voiceCommandManager.stopListening()`, set state to `idle`, and speak a short "Disconnected" message (or simply stop silently as per user preference - I'll use a short message for clarity).
- **Cleanup**:
  - Ensure all `isProcessing` flags are reset correctly in error paths.

## Verification Plan

### Manual Verification
1.  **Unsupported Feature**:
    - Connect a watch that doesn't support reminders (e.g., ABL-100).
    - Say "Create reminder".
    - Confirm the app says "Feature not supported" and doesn't ask for the title.
2.  **Disconnection during Wizard**:
    - Start the reminder wizard ("Create reminder").
    - While the app is waiting for the title, manually disconnect the watch.
    - Confirm the voice interaction stops and the UI returns to idle.
3.  **Unsupported Settings**:
    - Try a command for a setting not supported by the model (e.g., "Turn on auto light" on a model that lacks it).
    - Confirm "Feature not supported" is spoken.
