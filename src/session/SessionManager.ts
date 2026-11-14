import GShockAPI from '@/api/GShockAPI';
import { connection } from '@api/Connection';
import { watchInfo } from '@api/WatchInfo';
import { cachedIO } from '@io/CachedIO';
import { Session } from './Session';
import { ConnectionButton, EntryReason, INITIAL_SESSION_STATE, SessionState } from './types';

/**
 * Maps the API's per-connection button flags to a ConnectionButton. This is the only place in the
 * app that reads those flags: everything else asks the Session. Valid once the watch has reported
 * its button, i.e. when a connection is being initialised.
 */
export const currentConnectionButton = (): ConnectionButton => {
  if (GShockAPI.isActionButtonPressed()) return ConnectionButton.FROM_ACTION;
  if (GShockAPI.isAutoTimeStarted()) return ConnectionButton.AUTOMATIC_SYNC;
  if (GShockAPI.isFindPhoneButtonPressed()) return ConnectionButton.FIND;
  return ConnectionButton.NORMAL;
};

/**
 * Single source of truth for watch connection sessions (mirrors SessionManager.kt).
 *
 * Invariants:
 *  - every connection gets its own Session; a closed session is never reused
 *  - currentSession keeps pointing at the last session after it closes, so observers can read the
 *    Closed reason; it is replaced on the next connection
 *  - the on* handlers are driven by SessionEventBridge and are idempotent
 *
 * subscribe/getSnapshot are for React's useSyncExternalStore.
 */
class SessionManager {
  private current: Session | null = null;
  private snapshot: SessionState = INITIAL_SESSION_STATE;
  private listeners = new Set<() => void>();
  private closeListeners = new Set<(state: SessionState) => void>();

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = (): SessionState => this.snapshot;

  get sessionState(): SessionState {
    return this.snapshot;
  }

  get currentSession(): Session | null {
    return this.current;
  }

  /** The current session if it has not closed, else null. */
  get activeSession(): Session | null {
    return this.current?.isActive ? this.current : null;
  }

  /** True while the current session is Ready: the watch is connected and initialised. */
  get isReady(): boolean {
    return this.current?.state.phase.kind === 'Ready';
  }

  /** The button that started the current connection, or null before the first connection is Ready. */
  get connectionButton(): ConnectionButton | null {
    return this.current?.button ?? null;
  }

  /** Runs `listener` once for every session that closes. Returns a function that unregisters it. */
  onSessionClosed(listener: (state: SessionState) => void): () => void {
    this.closeListeners.add(listener);
    return () => {
      this.closeListeners.delete(listener);
    };
  }

  /** Starts a new session in Connecting, closing the previous one if it is still active. */
  createSession(): Session {
    this.current?.close('New session started');

    const session: Session = new Session({
      currentButton: currentConnectionButton,
      disconnect: () => connection.disconnect(),
      onChange: () => this.publish(session),
    });
    // Per-connection data must not outlive the connection.
    session.registerCloseHook(() => {
      cachedIO.clearCache();
      watchInfo.reset();
    });
    session.registerCloseHook(() => this.closeListeners.forEach(l => l(session.state)));

    this.current = session;
    this.publish(session);
    return session;
  }

  /**
   * A connection attempt started. Makes sure there is an active session in Connecting. Idempotent:
   * a session that is already active (Connecting or Ready) is kept, never replaced.
   */
  onConnecting(): Session {
    return this.ensureActiveSession();
  }

  /**
   * The watch finished initialising: the session becomes Ready and its ConnectionButton is fixed.
   * Idempotent, so every subscriber of "WatchInitializationCompleted" gets the same session back.
   */
  onConnected(entryReason?: EntryReason): Session {
    const session = this.ensureActiveSession();
    session.setReady(entryReason);
    return session;
  }

  /** The watch reported its name ("DeviceName"). Ignored when no session is active. */
  onDeviceName(name: string): void {
    const session = this.activeSession;
    if (!session) {
      console.warn(`Ignoring device name '${name}': no active session`);
      return;
    }
    session.updateWatch(w => ({ ...w, name, model: String(watchInfo.model) }));
  }

  /** The watch reported its address ("DeviceAddress"). Ignored when no session is active. */
  onDeviceAddress(address: string): void {
    const session = this.activeSession;
    if (!session) {
      console.warn(`Ignoring device address '${address}': no active session`);
      return;
    }
    session.updateWatch(w => ({ ...w, address }));
  }

  /** The connection setup finished ("ConnectionSetupComplete"). Ignored when no session is active. */
  onSetupComplete(): void {
    const session = this.activeSession;
    if (!session) {
      console.warn('Ignoring setup complete: no active session');
      return;
    }
    session.markSetupComplete();
  }

  /**
   * An API-level error ("ApiError"). Fatal only while no connection is established, i.e. while
   * connecting or with no session. Once the session is Ready it is just a failed operation, so it
   * is logged and the session stays up.
   */
  onApiError(reason: string): void {
    if (this.activeSession?.state.phase.kind === 'Ready') {
      console.warn(`Ignoring API error while the session is Ready: ${reason}`);
      return;
    }
    this.onDisconnected(reason);
  }

  /**
   * The watch disconnected or the connection failed. Closes the current session. The first reason
   * wins: later events for an already-closed session are ignored. If no session exists yet, one is
   * created and closed so the failure reason is still observable.
   */
  onDisconnected(reason = 'Watch disconnected', isError = false): void {
    const current = this.current;
    if (!current) {
      this.createSession().close(reason, isError);
      return;
    }
    if (!current.isActive) return;
    current.close(reason, isError);
  }

  /** An error the user should be told about ("Error"). Closes the session and releases the connection. */
  onError(reason = ''): void {
    this.onDisconnected(reason, true);
  }

  /** The watch asked the app to run its actions ("RunActions"). Ignored without an active session. */
  onRunActionsRequested(): void {
    const session = this.activeSession;
    if (!session) {
      console.warn('Ignoring run-actions request: no active session');
      return;
    }
    session.beginRunActions();
  }

  private ensureActiveSession(): Session {
    return this.activeSession ?? this.createSession();
  }

  private publish(session: Session): void {
    if (session !== this.current) return;
    this.snapshot = session.state;
    this.listeners.forEach(l => l());
  }
}

export const sessionManager = new SessionManager();
