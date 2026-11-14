import { useCallback, useRef } from 'react';
import { sessionManager } from './SessionManager';
import { useSessionState } from './useSessionState';
import { ComponentId } from './types';

type Update<T> = T | ((prev: T) => T);

/**
 * Session-backed state for one screen.
 *  - value:  current (possibly unsaved) value; `initial` until loaded from the watch
 *  - dirty:  differs from what the watch has -> enable the Send/Save button
 *  - loaded: values were already read in this session (don't re-read, it would drop edits)
 *  - edit:   user changed something
 *  - load:   values read from the watch (keeps unsaved edits, re-baselines)
 *  - commit: values written to the watch (clean again)
 * `equals` (optional) overrides the default deep comparison between edited value and baseline.
 */
export function useSessionComponent<T>(id: ComponentId, initial: T, equals?: (a: T, b: T) => boolean) {
  useSessionState(); // re-render on every session change

  const initialRef = useRef(initial);
  const equalsRef = useRef(equals);
  equalsRef.current = equals;
  const session = sessionManager.activeSession;
  const loaded = session?.isLoaded(id) ?? false;
  const value = loaded ? (session!.get<T>(id) as T) : initialRef.current;
  const dirty = session?.isDirty(id) ?? false;

  const edit = useCallback((next: Update<T>) => {
    const s = sessionManager.activeSession;
    if (!s) return;
    const prev = s.get<T>(id);
    if (prev === undefined) return;
    s.edit(id, typeof next === 'function' ? (next as (p: T) => T)(prev) : next);
  }, [id]);

  const load = useCallback((fromWatch: T) => {
    sessionManager.activeSession?.load(id, fromWatch, equalsRef.current);
  }, [id]);

  const commit = useCallback((saved: T) => {
    sessionManager.activeSession?.commit(id, saved, equalsRef.current);
  }, [id]);

  return { value, loaded, dirty, edit, load, commit };
}
