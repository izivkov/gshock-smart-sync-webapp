# Implementation Plan - Accurate Voice UI Integration (Conversational)

Align the web application's Voice UI with the exact logic and conversational flow of the native Kotlin `CasioGShockSmartSync` application. This includes robust natural language parsing, specific audio feedback strings, and a multi-step interactive reminder wizard.

## User Review Required

> [!IMPORTANT]
> This update transitions from simple command parsing to a state-aware conversational agent that handles self-correction, filler words, and multi-turn dialogues for reminders.

## Conversational Design & Audio Feedback

The app will mirror the `VoiceDispatcher.kt` logic from the native project:

### 1. Robust Input Processing
- **Self-Correction**: Discard text before phrases like `"I mean"`, `"actually"`, or `"no wait"`.
- **Filler Removal**: Strip words like `"um"`, `"uh"`, `"ah"`, and `"like"`.
- **Abortion**: Phrases like `"cancel"`, `"abort"`, or `"stop"` will immediately terminate the session and say `"Canceled"`.

### 2. Exact Audio Feedback Strings
- **Activation**: `"Tell me what to do."`
- **Errors**: `"Command not understood"`, `"Command failed"`, `"This feature is not supported on the watch"`.
- **Success Feedbacks**:
  - Alarms: `"Alarm set for [time] [am/pm]"` or `"All alarms disabled"`.
  - Timers: `"Timer set for [duration]"` (e.g., `"Timer set for 5 minutes and 10 seconds"`).
  - Settings: `"[Setting Name] [enabled/disabled/to value]"`.
  - Reset: `"Settings reset to defaults"`.
- **Reminders**:
  - Prompt 1: `"What is the reminder for?"`
  - Prompt 2: `"When do you want to be reminded?"`
  - Prompt 3 (Optional): `"Should this repeat weekly, monthly, or yearly? Or say no."`
  - Completion: `"[Title] added [date feedback]"` (e.g., `"Doctor appointment added for tomorrow"`).

### 3. Expanded Commands
- **Relative Alarms**: `"Wake me up in 2 hours"`, `"Set alarm 3 hours from now"`.
- **Implicit Timers**: `"Timer at four ten"` (interpreted as 4:10).
- **Comprehensive Help**: Detailed verbal explanation of capabilities.

## Proposed Changes

### UI Components

#### [MODIFY] [Time.page.tsx](file:///home/izivkov/projects/gshock-smart-sync-webapp/src/pages/time/Time.page.tsx)
- Refactor `VoiceControlPanel` to a state machine handling: `idle`, `listening`, `reminder_title`, `reminder_date`, `reminder_repeat`.
- Implement `handleSelfCorrection` and `stripFillers` functions.
- Update `handleCommand` to support relative time calculations for alarms.
- Replace all placeholder feedback strings with the exact hardcoded strings from the Kotlin source.
- Enhance the `help` command display and verbal output.

## Verification Plan

### Manual Verification
1. **Self-Correction**: Say `"Set timer for 5 minutes, no wait, 10 minutes"` and verify it sets 10 minutes.
2. **Interactive Reminders**: Trigger `"create reminder"` and follow the 3-step prompt sequence (Title -> Date -> Repeat).
3. **Relative Alarms**: Say `"Wake me up in 1 hour"` and verify the alarm is set for the current time plus one hour.
4. **Verbal Consistency**: Ensure the spoken response matches the text feedback exactly as defined in `VoiceDispatcher.kt`.
