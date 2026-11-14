/** Structural equality, independent of key order. */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  return ka.every(k => k in b && deepEqual((a as any)[k], (b as any)[k]));
}

/**
 * Holds the value being edited on a screen together with the baseline it is compared
 * against (what the watch has). `dirty` is derived from the values themselves, so
 * changing something and then changing it back makes the screen clean again.
 */
export class ChangeTracker<T> {
  private baseline: T;
  private working: T;

  constructor(initial: T) {
    this.baseline = structuredClone(initial);
    this.working = initial;
  }

  get value(): T {
    return this.working;
  }

  get dirty(): boolean {
    return !deepEqual(this.working, this.baseline);
  }

  /** User edit. */
  edit(next: T): void {
    this.working = next;
  }

  /** Values read from the watch. Unsaved edits are kept, but compared against the new baseline. */
  load(fromWatch: T): void {
    const hadEdits = this.dirty;
    this.baseline = structuredClone(fromWatch);
    if (!hadEdits) this.working = fromWatch;
  }

  /** Values just written to the watch: screen is clean again. */
  commit(saved: T): void {
    this.baseline = structuredClone(saved);
    this.working = saved;
  }
}
