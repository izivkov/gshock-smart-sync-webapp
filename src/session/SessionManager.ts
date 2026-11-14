// SessionManager singleton implementation with automatic discarding of closed sessions
import { Session } from './Session';
import GShockAPI from '@/api/GShockAPI';
import {
  SessionState,
  ComponentId,
} from './types';

/**
 * Manages the lifecycle of a single Session.
 * A closed session is immediately discarded (set to null) as per user decision.
 * UI components can subscribe to state updates via `onStateChange`.
 */
class SessionManager {
  private current: Session | null = null;
  private listeners: ((state: SessionState | null) => void)[] = [];

  /** Create a new session, discarding any existing one. */
  async createSession(entryReason: 'NORMAL' | 'CONTENT_SELECTOR' | 'RUN_ACTIONS' = 'NORMAL') {
    if (this.current) {
      this.current.close('Replaced', false);
      this.current = null;
    }
    const session = new Session(GShockAPI);
    await session.connect(entryReason as any);
    this.current = session;
    this.notify();
    return session;
  }

  getCurrentSession(): Session | null {
    return this.current;
  }

  /** Subscribe to session state changes. Returns an unsubscribe function. */
  onStateChange(fn: (state: SessionState | null) => void) {
    this.listeners.push(fn);
    fn(this.current ? this.current.snapshot : null);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  markPendingSave(component: ComponentId) {
    if (this.current) {
      const s = this.current.snapshot as SessionState;
      s.pendingSaves.add(component);
      this.notify();
    }
  }

  clearPendingSave(component: ComponentId) {
    if (this.current) {
      const s = this.current.snapshot as SessionState;
      s.pendingSaves.delete(component);
      this.notify();
    }
  }

  getPendingComponents(): ComponentId[] {
    return this.current ? Array.from(this.current.snapshot.pendingSaves) : [];
  }

  /** Forcefully close and discard the current session. */
  closeCurrentSession(reason = 'UserClosed', isError = false) {
    if (this.current) {
      this.current.close(reason, isError);
      this.current = null;
      this.notify();
    }
  }

  private notify() {
    const snapshot = this.current ? this.current.snapshot : null;
    this.listeners.forEach(l => l(snapshot));
  }
}

export const sessionManager = new SessionManager();
