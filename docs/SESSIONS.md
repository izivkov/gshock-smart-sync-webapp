# Session Architecture & Connection Management

How a watch connection is modelled in the G-Shock Smart Sync web app. This mirrors the
`Session` architecture of the Android app (CasioGShockSmartSync, `docs/sessions.md`), so a
concept has the same name and role in both projects.

Source: `src/session/` plus `src/api/Connection.ts`.

---

## 1. What a session is, and why

A **Session** is one watch connection, from the moment the user presses *Pair Watch* until the
watch disconnects. It is the single source of truth for:

- what state the connection is in (connecting, ready, closed),
- which watch button started it (this decides which actions run),
- the watch's name, model and address,
- which screens hold **unsaved changes** (so *Send to Watch* buttons enable and disable correctly).

Before sessions, components subscribed to raw `ProgressEvents` strings on their own, and several of
them listened for names that were never emitted. Edits lived in per-screen `useState`, so they were
lost when you switched screens, and nothing tracked whether a screen still differed from the watch.

The rule now:

> **Connection events are observed in exactly one place (`SessionEventBridge`).
> Everything else asks the session.**

---

## 2. The pieces

```
 Web Bluetooth                  ProgressEvents (RxJS)
 ┌────────────┐   emits        ┌───────────────────┐
 │ Connection │───────────────▶│  event name +     │
 │ GShockAPI  │                │  optional payload │
 │ WatchInfo  │                └─────────┬─────────┘
 └────────────┘                          │ the ONLY subscriber for
        ▲                                │ connection events
        │ disconnect()                   ▼
        │                      ┌──────────────────────┐
        │                      │  SessionEventBridge  │  src/session/SessionEventBridge.ts
        │                      └──────────┬───────────┘
        │                                 │ on*() calls (idempotent)
        │                                 ▼
        │                      ┌──────────────────────┐
        │                      │    SessionManager    │  src/session/SessionManager.ts
        │                      │      (singleton)     │
        │                      └──────────┬───────────┘
        │                                 │ owns
        │                                 ▼
        │                      ┌──────────────────────┐
        └──────────────────────│   Session (current)  │  src/session/Session.ts
          on close             │  state · values ·    │
                               │  close hooks         │
                               └──────────┬───────────┘
                                          │ immutable SessionState snapshots
              ┌───────────────────────────┼───────────────────────────┐
              ▼                           ▼                           ▼
   ┌────────────────────┐    ┌──────────────────────┐    ┌─────────────────────────┐
   │ SessionActionRunner│    │ React: useSessionState│    │ Non-React code           │
   │ runs connection    │    │ useSessionComponent   │    │ PhoneFinder  (close hook)│
   │ actions when Ready │    │ App · ConnectButton   │    │ VoiceDispatcher          │
   └────────────────────┘    │ screens · WatchFeature│    │  (onSessionClosed)       │
                             └──────────────────────┘    └─────────────────────────┘
```

`SessionEventBridge` and `SessionActionRunner` are registered **once** at startup in `src/main.tsx`
(the equivalent of `GShockApplication.onCreate` on Android), before anything can connect.

---

## 3. Connection lifecycle

### 3.1 Phases

```
                 ConnectionStarted
   Disconnected ───────────────────▶ Connecting
   (initial)                             │
                                         │ WatchInitializationCompleted
                                         ▼
                                       Ready(entryReason)
                                         │
        Disconnect / ConnectionFailed /  │   (also from Connecting)
        ApiError (only before Ready) /   │
        Error                            ▼
                                       Closed(reason, isError)
```

- `Closed` is final. A closed session never becomes active again; the next connection creates a **new**
  `Session` (new `id`).
- `Session.close()` is idempotent: **the first reason wins**, later events for the same session are ignored.
- `SessionManager.currentSession` keeps pointing at the last session after it closes, so observers can
  still read the `Closed` reason. `activeSession` is the current session only while it has not closed.

### 3.2 A normal connection, step by step

```
 User          ConnectButton        Connection / GShockAPI        Bridge → Manager → Session
  │                  │                        │                              │
  │  Pair Watch      │                        │                              │
  ├─────────────────▶│  connection.start()    │                              │
  │                  ├───────────────────────▶│  emit ConnectionStarted ────▶│ onConnecting()
  │                  │                        │                              │   new Session: Connecting
  │   (browser device chooser)                │                              │
  │                  │                        │  setNameAndModel(name)       │
  │                  │                        │  emit DeviceName ───────────▶│ watch.name, watch.model
  │                  │                        │  setAddress(id)              │
  │                  │                        │  emit DeviceAddress ────────▶│ watch.address
  │                  │                        │  GATT + notifications set up │
  │                  │                        │  emit ConnectionSetupComplete▶ isSetupComplete = true
  │                  │                        │                              │
  │                  │  GShockAPI.init()      │                              │
  │                  ├───────────────────────▶│  reads button + app info     │
  │                  │                        │  emit WatchInitializationCompleted
  │                  │                        │                          ───▶│ onConnected()
  │                  │                        │                              │   Ready(entryReason)
  │                  │                        │                              │   button fixed
  │                                                                           ▼
  │                                           SessionActionRunner: runs the actions for `button` (once)
  │                                           App.tsx: NORMAL entry → navigate to /time/Time
  │
  │  ...use the app...
  │
  │  watch disconnects                         gattserverdisconnected
  │                                            emit Disconnect ───────────▶ onDisconnected()
  │                                                                          Closed("Watch disconnected")
  │                                                                          · unsaved edits dropped
  │                                                                          · cachedIO + watchInfo reset
  │                                                                          · close hooks run
  │                                            App.tsx: Closed → navigate to /
```

Notes:

- `ProgressEvents` delivers events **asynchronously** (a later task), in the order they were emitted.
  Handlers read the event's payload when they run, so two events with the same name emitted back to back
  can overwrite each other's payload. The connection events are emitted once per connection, so this does
  not occur in practice.
- `ConnectButton` calls `connection.start()` and then `GShockAPI.init()`. The session is **not** created
  by the button: it follows from the events.
- `Connection.start()` returns immediately (and emits nothing) when a connection exists or is being set
  up, so pressing *Pair Watch* again cannot disturb a live session.

### 3.3 Events handled by the bridge

| Event                          | Emitted by                                          | SessionManager call            | Effect on the session                                            |
|--------------------------------|-----------------------------------------------------|--------------------------------|------------------------------------------------------------------|
| `ConnectionStarted`            | `Connection.start()`                                | `onConnecting()`               | Ensures an active session in `Connecting` (keeps an active one)  |
| `DeviceName`                   | `WatchInfo.setNameAndModel()`                       | `onDeviceName(name)`           | `watch.name`, `watch.model`                                      |
| `DeviceAddress`                | `WatchInfo.setAddress()`                            | `onDeviceAddress(address)`     | `watch.address`                                                  |
| `ConnectionSetupComplete`      | `Connection.initDevice()`                           | `onSetupComplete()`            | `isSetupComplete = true`                                         |
| `WatchInitializationCompleted` | `GShockAPI.init()`                                  | `onConnected()`                | `Connecting → Ready`; fixes `button` and `entryReason`           |
| `Disconnect`                   | GATT `gattserverdisconnected` listener              | `onDisconnected()`             | `Closed("Watch disconnected")`                                   |
| `ConnectionFailed`             | `Connection.start()` (any failure, incl. cancelled chooser) | `onDisconnected()`     | `Closed("Connection Failed")`                                    |
| `ApiError`                     | `CasioIO`, `ResultQueue`                            | `onApiError(reason)`           | **Fatal only before Ready.** Once Ready it is logged and ignored |
| `RunActions`                   | `RunActionsIO` (watch asks the app to run actions)  | `onRunActionsRequested()`      | `isRunningActions = true` (only while Ready)                     |
| `Error`                        | (not emitted by the web app today)                  | `onError(reason)`              | `Closed(reason, isError = true)`                                 |

If an event arrives with no active session, the handlers log a warning and do nothing. If `Disconnect`
or `ConnectionFailed` arrives with no session at all, one is created and closed so the reason is still
observable.

Other `ProgressEvents` (for example `NeedToUpdateUI`) are unrelated to connections and still used
directly by screens.

---

## 4. Core types (`src/session/types.ts`)

### `ConnectionButton`: what started this connection

| Value              | Meaning                                         | Actions run by `SessionActionRunner`   |
|--------------------|-------------------------------------------------|----------------------------------------|
| `NORMAL`           | Lower-left long-press                           | `runActionForConnection()`             |
| `FROM_ACTION`      | Lower-right short-press (action button)         | `runActionsForActionButton()`          |
| `AUTOMATIC_SYNC`   | Watch connected by itself (Auto-Time)           | `runActionsForAutoTimeSetting()`       |
| `FIND`             | Find Phone pressed on the watch                 | `runActionFindPhone()`                 |
| `ALWAYS_CONNECTED` | Always-connected watches (not detectable on web)| `runActionForConnection()`             |

The button is read **once**, when the session becomes Ready, from the API's button flags
(`currentConnectionButton()` in `SessionManager.ts`, the only place that reads them). It never changes
for the lifetime of the session, even if `WatchInitializationCompleted` is delivered again.

### `EntryReason`: where the connection opens

```
 NORMAL                        → NORMAL            (main navigation, starts on Time)
 FROM_ACTION, AUTOMATIC_SYNC   → RUN_ACTIONS
 FIND, ALWAYS_CONNECTED        → CONTENT_SELECTOR
```

The web app has no dedicated screens for `RUN_ACTIONS` and `CONTENT_SELECTOR`, so only `NORMAL`
navigates (to `/time/Time`, unless you are already on a functional page).

### `SessionState`: immutable snapshot

```ts
interface SessionState {
  phase: SessionPhase;            // Disconnected | Connecting | Ready(entryReason) | Closed(reason, isError)
  button: ConnectionButton | null;// null until Ready; kept after close
  watch: { name; address; model };
  isSetupComplete: boolean;       // BLE link is up: per-connection data can be loaded
  isRunningActions: boolean;      // the watch asked the app to run its actions
  pendingSaves: ReadonlySet<ComponentId>; // screens that differ from the watch
  revision: number;               // bumped when a screen's value changes, so React re-renders
}
```

A **new object** is created on every change, so `useSyncExternalStore` can compare by reference.
(`revision` is the one difference from the Android state; Android does not hold edited values there.)

---

## 5. The classes

### `Session` (`Session.ts`)

A single-use, connection-scoped object.

- **State machine:** `setReady()`, `markSetupComplete()`, `updateWatch()`, `beginRunActions()`,
  `endRunActions()`, `close(reason, isError)`.
  Every mutator is a no-op once closed, so late callbacks from an old connection cannot resurrect it.
- **Screen values:** `load()`, `edit()`, `commit()`, `get()`, `isLoaded()`, `isDirty()` (see section 6).
- **Close hooks:** `registerCloseHook(hook)` runs `hook` once when the session closes (immediately if it
  already has) and returns an unregister function. This is how components clean up on disconnect.
- **On close, in order:** state becomes `Closed` and unsaved values are dropped → close hooks run →
  the BLE link is released (`connection.disconnect()`, a no-op if already down).

### `SessionManager` (`SessionManager.ts`)

The singleton that owns the current session.

- **Queries:** `sessionState`, `currentSession`, `activeSession`, `isReady`, `connectionButton`.
- **Event handlers** (called by the bridge): `onConnecting`, `onConnected`, `onDeviceName`,
  `onDeviceAddress`, `onSetupComplete`, `onApiError`, `onDisconnected`, `onError`, `onRunActionsRequested`.
  All are idempotent.
- **`onSessionClosed(listener)`:** runs the listener once for **every** session that closes. For
  long-lived singletons (like `VoiceDispatcher`) that outlive any one session.
- **`subscribe` / `getSnapshot`:** for React's `useSyncExternalStore`.
- **Per-connection cleanup:** every new session gets a close hook that clears `cachedIO` and resets
  `watchInfo`, so nothing from one connection leaks into the next.
- `createSession()` closes a still-active previous session before starting a new one.

### `SessionEventBridge` (`SessionEventBridge.ts`)

Subscribes to the connection events once (guarded, so calling it twice is harmless) and translates them
into `SessionManager` calls. Table in section 3.3.

### `SessionActionRunner` (`SessionActionRunner.ts`)

The equivalent of Android's `ActionRunner`. Process-wide, no UI required.

- When a session becomes **Ready**, it runs the actions for the session's `button` **once per session**
  (and sends the one-per-connection download-analytics request, except on localhost).
- When the session's `isRunningActions` turns on (the watch sent `RunActions`), it runs the action-button
  actions and then calls `session.endRunActions()`.

There is no ordering dependency on any other subscriber: it only watches the session.

### Hooks (`useSessionState.ts`, `useSessionComponent.ts`)

- `useSessionState()` returns the current `SessionState` and re-renders on every change.
- `useSessionComponent(id, initial, equals?)` is the per-screen state (section 6).

---

## 6. Unsaved changes and the Send buttons

Each screen keeps its **working value** and a **baseline** (what the watch has) in the session, as a
`ChangeTracker`. The screen is *dirty* when the two differ **by value**:

```
 watch ──read──▶ load(value) ──┐
                               ▼
                   ┌─────────────────────────┐
                   │ baseline = watch value  │
                   │ working  = watch value  │   dirty = false → Send disabled
                   └────────────┬────────────┘
                                │ user edits
                                ▼
                   ┌─────────────────────────┐
                   │ working ≠ baseline      │   dirty = true  → Send enabled
                   └───┬──────────────┬──────┘
          user reverts │              │ Send succeeds
          the change   ▼              ▼
              working = baseline   commit(saved)
              dirty = false        baseline = working = saved, dirty = false
```

- Reverting a change makes the button disable again, because dirtiness is a comparison, not a flag.
- **Unsaved edits survive switching screens.** They are dropped only when the session closes.
- A screen reads from the watch only the **first** time it is shown in a session (`loaded` is false).
  A later `load()` keeps unsaved edits and re-baselines against the new watch values.
- `edit()` is ignored until the screen has been loaded, so edits to placeholder defaults are not lost
  into thin air.

### Hook API

```ts
const { value, loaded, dirty, edit, load, commit } =
  useSessionComponent<T>(ComponentId.X, initialValue, equals?);
```

| Member   | Use                                                                             |
|----------|---------------------------------------------------------------------------------|
| `value`  | Current (possibly unsaved) value; `initialValue` until loaded                   |
| `loaded` | Already read in this session. If true, skip reading from the watch              |
| `dirty`  | Differs from the watch. Use for `disabled={!dirty}` on the Send/Save button     |
| `edit`   | The user changed something. Accepts a value or `prev => next`                   |
| `load`   | Values read from the watch                                                      |
| `commit` | Values just written to the watch                                                |
| `equals` | Optional comparison, for screens whose edited objects differ in shape from the watch's |

### Screens

| Screen        | `ComponentId` | Button gating                                                                           |
|---------------|---------------|-----------------------------------------------------------------------------------------|
| Alarms        | `ALARMS`      | *Send to Watch* enabled while dirty                                                     |
| Reminders     | `EVENTS`      | Enabled while dirty; compares with `remindersEqual` (see below)                         |
| Settings      | `SETTINGS`    | Enabled while dirty                                                                     |
| Time (timer)  | `TIMER`       | *Set Timer* enabled while dirty                                                         |
| Time (clock)  | none          | *Set Time* is always enabled (its value keeps changing), except while it is being sent |
| Health        | none          | The profile dialog's *Save* is enabled while its fields differ from the loaded profile  |

`remindersEqual` (in `ReminderUtils.ts`) compares reminders by what is sent to the watch: title, enabled,
repeat period, start and end date (a missing end date means "same as start"), days of week (order
ignored) and `incompatible`. The reminder card adds a UI-only `occurrences` field, so a plain deep
comparison would never see a reverted edit as unchanged.

---

## 7. How the rest of the app uses the session

| Code                              | Uses                                    | For                                                                    |
|-----------------------------------|-----------------------------------------|------------------------------------------------------------------------|
| `App.tsx`                         | `useSessionState()`                     | Navigate to `/time/Time` on a Ready `NORMAL` entry; to `/` on `Closed`. Provides `ConnectionContext.isConnected` (`isSetupComplete` and not `Closed`) |
| `ConnectButton.tsx`               | `useSessionState()`                     | "Connecting..." while the phase is `Connecting`                        |
| `WatchFeature.tsx`                | `useSessionState()`                     | Re-evaluate which features the connected model supports                |
| `Time.page.tsx`                   | `useSessionState()`, `useSessionComponent` | Watch name; timer state                                             |
| Alarms, Reminders, Settings pages | `useSessionComponent`                   | Edited values and Send gating                                          |
| `PhoneFinder.ts`                  | `activeSession.registerCloseHook()`     | Stop ringing if the watch disconnects                                  |
| `VoiceDispatcher.ts`              | `sessionManager.onSessionClosed()`      | Stop listening and reset when the connection ends                      |
| `SessionActionRunner.ts`          | `sessionManager.subscribe()`            | Run connection actions                                                 |

Do **not** subscribe to `ProgressEvents` for `Connected`-style information in components. Read the
session instead.

---

## 8. Recipes

### A new screen that can have unsaved changes

1. Add an id to `ComponentId` in `types.ts`.
2. In the page:

```tsx
const { value, loaded, dirty, edit, load, commit } =
  useSessionComponent<MyData>(ComponentId.MY_SCREEN, defaultValue);

useEffect(() => {
  if (loaded) return;                    // keep edits made earlier in this session
  let cancelled = false;
  (async () => {
    const fromWatch = await GShockAPI.getMyData();
    if (!cancelled) load(fromWatch);
  })();
  return () => { cancelled = true; };
}, []);

const send = async () => {
  await actionsContainer.getAction(SetMyDataAction).run(value);
  commit(value);
};

<Button disabled={!dirty} onClick={send}>Send to Watch</Button>
```

### Cleanup that must happen when the watch disconnects

- Per-instance (a component or service that exists during one connection):
  `const off = sessionManager.activeSession?.registerCloseHook(cleanup);` and call `off?.()` if you finish earlier.
- Long-lived singleton: `sessionManager.onSessionClosed(() => { ... })`.

### Reacting to the connection in a component

```tsx
const { phase, isSetupComplete, watch } = useSessionState();
```

---

## 9. Differences from the Android implementation

| Area                      | Android (Kotlin)                          | Web (TypeScript)                                              |
|---------------------------|-------------------------------------------|---------------------------------------------------------------|
| State holder              | `StateFlow<SessionState>`                 | Immutable snapshot + `useSyncExternalStore`                   |
| Edited values             | Held by ViewModels; session tracks flags  | Held **by the session** (`ChangeTracker`), flags derived      |
| Session scope             | `sessionScope` coroutine scope            | Not needed; close hooks cover cleanup                         |
| `ALWAYS_CONNECTED`        | Detected                                  | Not detectable; behaves like `NORMAL`                         |
| Entry screens             | `CoverScreen`, `RunActionsScreen`, ...    | Only `NORMAL` navigates                                       |
| Who calls `init()`        | App/library                               | `ConnectButton` (after `connection.start()`)                  |
| Event delivery            | Library callbacks                         | RxJS, asynchronous; payload read at delivery                  |

---

## 10. File map

```
src/session/
  types.ts                 ConnectionButton, EntryReason, ComponentId, SessionPhase, SessionState
  Session.ts               one connection: state machine, screen values, close hooks
  SessionManager.ts        singleton: current session, idempotent on*() handlers
  SessionEventBridge.ts    the only subscriber to connection events
  SessionActionRunner.ts   runs connection actions per session
  ChangeTracker.ts         working value vs baseline, deepEqual
  useSessionState.ts       React: the current SessionState
  useSessionComponent.ts   React: per-screen value, dirty flag, load/edit/commit
src/api/Connection.ts      emits ConnectionStarted / ConnectionSetupComplete / ConnectionFailed / Disconnect
src/main.tsx               registers the bridge and the runner once at startup
```

---

## 11. Debugging

- Every `ProgressEvents` emission is logged to the console (`Events { payload, id }`). A healthy connect
  shows `ConnectionStarted`, `DeviceName`, `DeviceAddress`, `ConnectionSetupComplete`,
  `WatchInitializationCompleted`, in that order.
- **Connection closes right after connecting?** Look for an `ApiError` between `ConnectionStarted` and
  `WatchInitializationCompleted`: before Ready it is fatal by design. (`ResultQueue.dequeue` emits it when
  a response arrives with no request waiting.)
- **A screen's Send button never enables?** Check the screen is wired to `useSessionComponent` and calls
  `load()` once the watch values arrive; `edit()` is ignored before that.
- **Screen's Send button never disables after reverting?** The edited object and the watch's object
  differ in shape. Pass an `equals` function to `useSessionComponent`, as Reminders does.
- **Inspect the session:** temporarily add `console.log(sessionManager.sessionState)` where you need it
  (phase, button, watch, `pendingSaves`), or read it from a component with `useSessionState()`.
