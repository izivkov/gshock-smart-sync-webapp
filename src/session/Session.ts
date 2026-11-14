import { ChangeTracker } from './ChangeTracker';
import { ComponentId, EntryReason, SessionPhase } from './types';

/**
 * One BLE connection. Holds, per screen, the value being edited and its baseline, so unsaved
 * changes survive switching screens and are dropped only when the session closes (disconnect).
 */
export class Session {
  public phase: SessionPhase = 'Connecting';
  private trackers = new Map<ComponentId, ChangeTracker<any>>();

  constructor(
    public readonly entryReason: EntryReason,
    private readonly onChange: () => void,
  ) {}

  isLoaded(id: ComponentId): boolean {
    return this.trackers.has(id);
  }

  isDirty(id: ComponentId): boolean {
    return this.trackers.get(id)?.dirty ?? false;
  }

  get<T>(id: ComponentId): T | undefined {
    return this.trackers.get(id)?.value;
  }

  pendingComponents(): ComponentId[] {
    return [...this.trackers].filter(([, t]) => t.dirty).map(([id]) => id);
  }

  /** Values read from the watch. */
  load<T>(id: ComponentId, value: T): void {
    const tracker = this.trackers.get(id);
    if (tracker) tracker.load(value);
    else this.trackers.set(id, new ChangeTracker(value));
    this.onChange();
  }

  /** User edit. Ignored until the screen's values have been loaded from the watch. */
  edit<T>(id: ComponentId, value: T): void {
    this.trackers.get(id)?.edit(value);
    this.onChange();
  }

  /** Values successfully written to the watch. */
  commit<T>(id: ComponentId, value: T): void {
    const tracker = this.trackers.get(id);
    if (tracker) tracker.commit(value);
    else this.trackers.set(id, new ChangeTracker(value));
    this.onChange();
  }

  close(reason: string, isError: boolean): void {
    this.phase = { closed: { reason, isError } };
    this.trackers.clear();
  }
}
