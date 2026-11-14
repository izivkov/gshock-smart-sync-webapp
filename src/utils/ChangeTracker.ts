// Utility to track changes for a component and mark pending saves in SessionManager
import { ComponentId } from '@/session/types';
import { sessionManager } from '@/session/SessionManager';

/**
 * ChangeTracker compares a current value with a baseline snapshot.
 * When the values differ, it marks the component as having pending saves
 * via `sessionManager.markPendingSave`. When they match, the pending flag is cleared.
 *
 * `T` should be a serializable type; the default equality check uses a deep JSON comparison.
 */
export class ChangeTracker<T> {
  private baseline: T | null = null;

  constructor(
    private componentId: ComponentId,
    private equalsFn: (a: T, b: T) => boolean = (a, b) => JSON.stringify(a) === JSON.stringify(b)
  ) {}

  /** Set the baseline state (e.g., after a successful write) */
  setBaseline(baseline: T): void {
    // clone to avoid external mutation side‑effects
    this.baseline = structuredClone(baseline) as T;
    // baseline matches current, so clear pending flag
    sessionManager.clearPendingSave(this.componentId);
  }

  /** Compare the current value against the baseline and update pending‑save flag */
  update(current: T): void {
    if (this.baseline && this.equalsFn(current, this.baseline)) {
      sessionManager.clearPendingSave(this.componentId);
    } else {
      sessionManager.markPendingSave(this.componentId);
    }
  }
}
