// Session related enums and types
export type SessionPhase =
  | 'Connecting'
  | { ready: { entryReason: EntryReason } }
  | { closed: { reason: string; isError: boolean } };

export enum ConnectionButton {
  NORMAL = 'NORMAL',
  FROM_ACTION = 'FROM_ACTION',
  AUTOMATIC_SYNC = 'AUTOMATIC_SYNC',
  FIND = 'FIND',
  ALWAYS_CONNECTED = 'ALWAYS_CONNECTED',
}

export enum EntryReason {
  NORMAL = 'NORMAL',
  CONTENT_SELECTOR = 'CONTENT_SELECTOR',
  RUN_ACTIONS = 'RUN_ACTIONS',
}

export enum ComponentId {
  ALARMS = 'ALARMS',
  SETTINGS = 'SETTINGS',
  EVENTS = 'EVENTS',
  TIMER = 'TIMER',
  ACTIONS = 'ACTIONS',
}
