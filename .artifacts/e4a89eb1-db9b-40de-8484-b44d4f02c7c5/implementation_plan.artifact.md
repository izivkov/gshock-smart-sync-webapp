# Implementation Plan - Align Reminders Logic (Manual Mode)

Align the reminders logic with the Kotlin project, assuming the app is effectively always in "Manual Mode" (no auto-sync from calendar). This involves disabling automatic reminder syncing on connection and enhancing the voice command flow to support repeat periods.

## User Review Required

> [!NOTE]
> Since this project does not sync with Google Calendar, I am disabling the automatic reminder sync that previously occurred whenever the watch connected. Reminders will now only be updated when you explicitly use a voice command or press "Send to Watch" in the UI.

## Proposed Changes

### 1. Disable Auto-Sync
#### [MODIFY] [ActionsContainer.ts](file:///home/izivkov/projects/gshock-smart-sync-webapp/src/api/actions/ActionsContainer.ts)
- Update `SetRemindersAction.shouldRun`: Return `false` for `NORMAL_CONNECTION`, `ACTION_BUTTON_PRESSED`, and `AUTO_TIME_ADJUSTMENT`.
- This ensures reminders are only sent via `VOICE_COMMAND` or `DIRECT_INVOCATION` (UI).

### 2. Enhance Voice Intent Parsing
#### [MODIFY] [IntentParser.ts](file:///home/izivkov/projects/gshock-smart-sync-webapp/src/api/voice/IntentParser.ts)
- Update the `ADD_REMINDER` command return value to include the `repeatPeriod` parsed from the initial speech.

### 3. Complete Voice Conversation
#### [MODIFY] [VoiceDispatcher.ts](file:///home/izivkov/projects/gshock-smart-sync-webapp/src/api/voice/VoiceDispatcher.ts)
- Update `handleReminderConversation` to include a third step: asking for the repeat period ("Should this repeat weekly, monthly, or yearly?").
- Update `finalizeReminder` to use the collected `repeatPeriod` and correctly set `daysOfWeek` for weekly reminders.

## Verification Plan

### Automated Tests
- Run `npx tsc --noEmit` to verify type safety.

### Manual Verification
- **Auto-Sync Test**: Connect the watch and verify that `SetRemindersAction` is NOT triggered automatically (check console logs).
- **Voice Reminder Test**:
    - Say "Set reminder".
    - Follow the prompts for title, date, and repeat period.
    - Verify the final confirmation (e.g., "Buy milk added for tomorrow, repeating weekly").
- **Direct UI Test**: Verify that "Send to Watch" on the Events page still works correctly.
