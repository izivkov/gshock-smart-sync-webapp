import { ChangeTracker } from './ChangeTracker';
import {
  ComponentId, ConnectionButton, EntryReason, INITIAL_SESSION_STATE,
  SessionState, WatchSnapshot, entryReasonForButton,
} from './types';

export interface SessionDeps {
  /** Which watch button started this connection. Only valid once the watch has been initialised. */
  currentButton: () => ConnectionButton;
  /** Releases the BLE link. Must be a no-op when it is already down. */
  disconnect: () => void;
  /** Called after every state change. */
  onChange: () => void;
}

let nextSessionId = 0;

/**
 * One watch connection (mirrors Session.kt). Single-use: once closed it never becomes active again,
 * and every mutator is a no-op on a closed session, so late callbacks from an old connection cannot
 * resurrect it. Owns the connection phase, watch snapshot and each screen's edited value, so unsaved
 * changes survive switching screens and are dropped only when the session closes.
 */
export class Session {
  readonly id = `session-${++nextSessionId}`;

  private _state: SessionState = { ...INITIAL_SESSION_STATE, phase: { kind: 'Connecting' } };
  private trackers = new Map<ComponentId, ChangeTracker<any>>();
  private closeHooks: Array<() => void> = [];
  private hooksRan = false;

  constructor(private readonly deps: SessionDeps) {}

  get state(): SessionState {
    return this._state;
  }

  /** True until close() is called. */
  get isActive(): boolean {
    return this._state.phase.kind !== 'Closed';
  }

  /** The button that started this connection; null until the session is Ready. */
  get button(): ConnectionButton | null {
    return this._state.button;
  }

  /**
   * Connecting -> Ready; fixes the connection button for the rest of the session. Returns false (and
   * changes nothing) if the session is already Ready or Closed, so repeated "initialised" events
   * cannot change the button.
   */
  setReady(entryReason?: EntryReason, button?: ConnectionButton): boolean {
    if (this._state.phase.kind !== 'Connecting') return false;
    const resolvedButton = button ?? this.deps.currentButton();
    const resolvedReason = entryReason ?? entryReasonForButton(resolvedButton);
    return this.update(s => ({
      ...s,
      phase: { kind: 'Ready', entryReason: resolvedReason },
      button: resolvedButton,
    }));
  }

  updateWatch(transform: (watch: WatchSnapshot) => WatchSnapshot): void {
    this.update(s => ({ ...s, watch: transform(s.watch) }));
  }

  markSetupComplete(): void {
    this.update(s => ({ ...s, isSetupComplete: true }));
  }

  /** The user moved on from the entry screen to the main navigation. */
  enterMainNavigation(): void {
    this.update(s =>
      s.phase.kind === 'Ready' ? { ...s, phase: { kind: 'Ready', entryReason: EntryReason.NORMAL } } : s);
  }

  /** The watch asked the app to run its actions. Only meaningful while Ready. */
  beginRunActions(): void {
    this.update(s => (s.phase.kind === 'Ready' ? { ...s, isRunningActions: true } : s));
  }

  endRunActions(): void {
    this.update(s => ({ ...s, isRunningActions: false }));
  }

  // ---- Screen values and pending saves -------------------------------------------------------

  isLoaded(id: ComponentId): boolean {
    return this.trackers.has(id);
  }

  isDirty(id: ComponentId): boolean {
    return this.trackers.get(id)?.dirty ?? false;
  }

  get<T>(id: ComponentId): T | undefined {
    return this.trackers.get(id)?.value;
  }

  /** Values read from the watch. Unsaved edits are kept, but compared against the new baseline. */
  load<T>(id: ComponentId, value: T, equals?: (a: T, b: T) => boolean): void {
    if (!this.isActive) return;
    const tracker = this.trackers.get(id);
    if (tracker) tracker.load(value);
    else this.trackers.set(id, new ChangeTracker(value, equals));
    this.valuesChanged();
  }

  /** User edit. Ignored until the screen's values have been loaded from the watch. */
  edit<T>(id: ComponentId, value: T): void {
    if (!this.isActive) return;
    this.trackers.get(id)?.edit(value);
    this.valuesChanged();
  }

  /** Values successfully written to the watch: the screen is clean again. */
  commit<T>(id: ComponentId, value: T, equals?: (a: T, b: T) => boolean): void {
    if (!this.isActive) return;
    const tracker = this.trackers.get(id);
    if (tracker) tracker.commit(value);
    else this.trackers.set(id, new ChangeTracker(value, equals));
    this.valuesChanged();
  }

  // ---- Lifecycle -----------------------------------------------------------------------------

  /**
   * Runs `hook` once when the session closes (immediately if it already has). Returns a function
   * that unregisters it.
   */
  registerCloseHook(hook: () => void): () => void {
    if (this.hooksRan) {
      this.runHook(hook);
      return () => {};
    }
    this.closeHooks.push(hook);
    return () => {
      this.closeHooks = this.closeHooks.filter(h => h !== hook);
    };
  }

  /** Idempotent: only the first call has any effect, so the first (usually most informative) reason wins. */
  close(reason = 'Disconnected', isError = false): void {
    const closed = this.update(
      s => ({
        ...s,
        phase: { kind: 'Closed', reason, isError },
        pendingSaves: new Set<ComponentId>(),
        isRunningActions: false,
        revision: s.revision + 1,
      }),
      true,
    );
    if (!closed) return;

    this.trackers.clear();

    this.hooksRan = true;
    const hooks = this.closeHooks;
    this.closeHooks = [];
    hooks.forEach(h => this.runHook(h));

    try {
      this.deps.disconnect();
    } catch (e) {
      console.error('Error disconnecting in Session.close', e);
    }
  }

  private valuesChanged(): void {
    const dirty = new Set<ComponentId>();
    this.trackers.forEach((tracker, id) => {
      if (tracker.dirty) dirty.add(id);
    });
    this.update(s => ({ ...s, pendingSaves: dirty, revision: s.revision + 1 }));
  }

  private runHook(hook: () => void): void {
    try {
      hook();
    } catch (e) {
      console.error('Error executing session close hook', e);
    }
  }

  /** Applies `transform` unless the session is closed (or `closing`). Returns whether it was applied. */
  private update(transform: (s: SessionState) => SessionState, closing = false): boolean {
    if (this._state.phase.kind === 'Closed') return false;
    const next = transform(this._state);
    if (next === this._state && !closing) return false;
    this._state = next;
    this.deps.onChange();
    return true;
  }
}
