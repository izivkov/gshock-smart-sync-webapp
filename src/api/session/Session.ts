// Session class wrapping GShockAPI and exposing write methods
import GShockAPI from '@/api/GShockAPI';
import { SessionState, ComponentId } from './types';

/**
 * Represents a single BLE connection session. It forwards all write operations to the underlying GShockAPI instance.
 * UI components obtain a Session from SessionManager and call these methods.
 */
export class Session {
  /** Snapshot of the current session state. UI may read this for pending‑save flags etc. */
  public snapshot: SessionState;

  constructor(private api: typeof GShockAPI) {
    // initialise a minimal snapshot – will be updated during connect/close.
    this.snapshot = {
      phase: 'Disconnected',
      pendingSaves: new Set<ComponentId>(),
    } as SessionState;
  }

  /** Establish the BLE connection and initialise the watch. */
  async connect(entryReason: 'NORMAL' | 'CONTENT_SELECTOR' | 'RUN_ACTIONS' = 'NORMAL'): Promise<void> {
    (this.snapshot as any).phase = 'Connecting';
    await this.api.init();
    (this.snapshot as any).phase = { ready: { entryReason } };
  }

  /** Close the session – discards state and notifies listeners. */
  close(reason = 'UserClosed', isError = false): void {
    // No explicit disconnect method on GShockAPI; assume underlying connection is handled elsewhere.
    (this.snapshot as any).phase = { closed: { reason, isError } };
  }

  /** Register a hook that runs when the session is closed. */
  registerCloseHook(fn: () => void): void {
    if ((this.snapshot.phase as any).closed) {
      fn();
    }
  }

  /** Write helpers – each clears its pending flag after a successful write. */
  async setAlarms(alarms: any[]): Promise<void> {
    await this.api.setAlarms(alarms);
    this.snapshot.pendingSaves.delete(ComponentId.ALARMS);
  }

  async setReminders(reminders: any[]): Promise<void> {
    await this.api.setReminders(reminders);
    this.snapshot.pendingSaves.delete(ComponentId.EVENTS);
  }

  async setSettings(settings: any): Promise<void> {
    await this.api.setSettings(settings);
    this.snapshot.pendingSaves.delete(ComponentId.SETTINGS);
  }

  async setTimer(timerValue: number): Promise<void> {
    await this.api.setTimer(timerValue);
    this.snapshot.pendingSaves.delete(ComponentId.TIMER);
  }

  async setExerciseProfile(profile: any): Promise<void> {
    await this.api.setExerciseProfile(profile);
    this.snapshot.pendingSaves.delete(ComponentId.HEALTH_PROFILE);
  }

  // Optional: timezone helper (used by time sync actions if needed)
  async setTimezone(timeZone: string): Promise<void> {
    // @ts-ignore – runtime provides this method on GShockAPI
    await this.api.setTimezone(timeZone);
    this.snapshot.pendingSaves.delete(ComponentId.SETTINGS);
  }

  async setEvent(eventIndex: number, updatedEvent: any): Promise<void> {
    await this.api.setEvent(eventIndex, updatedEvent);
    this.snapshot.pendingSaves.delete(ComponentId.EVENTS);
  }
}
