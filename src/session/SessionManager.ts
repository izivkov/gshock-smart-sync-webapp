import GShockAPI from '@/api/GShockAPI';
import { connection } from '@api/Connection';
import { cachedIO } from '@io/CachedIO';
import { Session } from './Session';
import { EntryReason } from './types';

/**
 * Owns the single current Session. The session exists from the moment the user presses connect
 * (so screens that mount during connection find it) until the phone disconnects.
 * Exposes a subscribe/version pair for React's useSyncExternalStore.
 */
class SessionManager {
  private current: Session | null = null;
  private version = 0;
  private listeners = new Set<() => void>();

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getVersion = (): number => this.version;

  getCurrentSession(): Session | null {
    return this.current;
  }

  /** Connect to the watch and initialise it. Replaces any existing session. */
  async createSession(entryReason: EntryReason = EntryReason.NORMAL): Promise<Session> {
    this.closeCurrentSession('Replaced');
    const session = new Session(entryReason, () => this.notify());
    this.current = session;
    this.notify();

    try {
      await connection.start();
      if (!connection.isConnected()) throw new Error('Watch not connected');
      await GShockAPI.init();
      if (this.current === session) {
        session.phase = { ready: { entryReason } };
        this.notify();
      }
      return session;
    } catch (e) {
      if (this.current === session) this.closeCurrentSession('ConnectFailed', true);
      throw e;
    }
  }

  /** Discard the session and everything cached for it. Called on disconnect. */
  closeCurrentSession(reason = 'UserClosed', isError = false): void {
    const session = this.current;
    if (!session) return;
    this.current = null;
    session.close(reason, isError);
    cachedIO.clearCache();
    this.notify();
  }

  private notify(): void {
    this.version++;
    this.listeners.forEach(l => l());
  }
}

export const sessionManager = new SessionManager();
