// Mirrors CasioGShockSmartSync: session/{ConnectionButton,SessionState,ComponentId}.kt

/** The watch button (or event) that started the current connection. Fixed for the lifetime of a Session. */
export enum ConnectionButton {
  NORMAL = 'NORMAL',                     // LOWER-LEFT long-press
  FROM_ACTION = 'FROM_ACTION',           // LOWER-RIGHT short-press (action button)
  AUTOMATIC_SYNC = 'AUTOMATIC_SYNC',     // watch connected by itself (Auto-Time), no button pressed
  FIND = 'FIND',                         // Find Phone pressed on the watch
  ALWAYS_CONNECTED = 'ALWAYS_CONNECTED', // always-connected watches
}

/** Where a connection opens. */
export enum EntryReason {
  NORMAL = 'NORMAL',
  CONTENT_SELECTOR = 'CONTENT_SELECTOR',
  RUN_ACTIONS = 'RUN_ACTIONS',
}

export const entryReasonForButton = (button: ConnectionButton): EntryReason => {
  switch (button) {
    case ConnectionButton.NORMAL:
      return EntryReason.NORMAL;
    case ConnectionButton.FROM_ACTION:
    case ConnectionButton.AUTOMATIC_SYNC:
      return EntryReason.RUN_ACTIONS;
    case ConnectionButton.FIND:
    case ConnectionButton.ALWAYS_CONNECTED:
      return EntryReason.CONTENT_SELECTOR;
  }
};

/** Components that can hold unsaved changes. */
export enum ComponentId {
  ALARMS = 'ALARMS',
  SETTINGS = 'SETTINGS',
  EVENTS = 'EVENTS',
  TIMER = 'TIMER',
  ACTIONS = 'ACTIONS',
}

export type SessionPhase =
  | { kind: 'Disconnected' }
  | { kind: 'Connecting' }
  | { kind: 'Ready'; entryReason: EntryReason }
  /** `isError` marks a failure the user should be told about; `reason` may then be blank. */
  | { kind: 'Closed'; reason: string; isError: boolean };

export interface WatchSnapshot {
  name: string;
  address: string;
  model: string;
}

/** Immutable snapshot of a session. A new object is created on every change. */
export interface SessionState {
  phase: SessionPhase;
  /** Null until the session is Ready. Kept after the session closes. */
  button: ConnectionButton | null;
  watch: WatchSnapshot;
  /** True once the BLE link is up ("ConnectionSetupComplete"). Per-connection data can be loaded from then on. */
  isSetupComplete: boolean;
  /** True while actions requested by the watch ("RunActions") are running. */
  isRunningActions: boolean;
  pendingSaves: ReadonlySet<ComponentId>;
  /** Bumped when a screen's edited value changes, so React re-renders. Not part of the Kotlin state. */
  revision: number;
}

export const INITIAL_SESSION_STATE: SessionState = {
  phase: { kind: 'Disconnected' },
  button: null,
  watch: { name: '', address: '', model: '' },
  isSetupComplete: false,
  isRunningActions: false,
  pendingSaves: new Set<ComponentId>(),
  revision: 0,
};

export const isPendingSave = (state: SessionState, component: ComponentId): boolean =>
  state.pendingSaves.has(component);
