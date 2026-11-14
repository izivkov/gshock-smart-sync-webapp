import { useSyncExternalStore } from 'react';
import { sessionManager } from './SessionManager';
import { SessionState } from './types';

/** The current session's state; re-renders on every change. */
export function useSessionState(): SessionState {
  return useSyncExternalStore(sessionManager.subscribe, sessionManager.getSnapshot);
}
