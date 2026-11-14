import { actionsContainer } from '@/actions/ActionsContainer';
import { watchInfo } from '@api/WatchInfo';
import { sessionManager } from './SessionManager';
import { ConnectionButton } from './types';

let started = false;

async function runActionsWhenReady(button: ConnectionButton | null): Promise<void> {
  // Download analytics: one request per connection (not on localhost).
  const watchModel = watchInfo.shortName || watchInfo.name;
  if (watchModel && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    fetch(`/time/Time?watch=${encodeURIComponent(watchModel)}&_t=${Date.now()}`, { mode: 'no-cors', cache: 'no-store' })
      .catch(() => {});
  }

  switch (button) {
    case ConnectionButton.FROM_ACTION:
      return actionsContainer.runActionsForActionButton();
    case ConnectionButton.AUTOMATIC_SYNC:
      return actionsContainer.runActionsForAutoTimeSetting();
    case ConnectionButton.FIND:
      return actionsContainer.runActionFindPhone();
    case ConnectionButton.NORMAL:
    case ConnectionButton.ALWAYS_CONNECTED:
      return actionsContainer.runActionForConnection();
    case null:
      return;
  }
}

/**
 * Runs the connection actions (mirrors ActionRunner.kt). Everything is driven by the Session: the
 * actions run once per session when it becomes Ready, and again whenever the watch asks for them.
 * There is no ordering dependency on other subscribers of the connection events. Call once at startup.
 */
export function setupSessionActionRunner(): void {
  if (started) return;
  started = true;

  let readyHandledFor: string | null = null;
  let runningRequestedActions = false;

  sessionManager.subscribe(() => {
    const session = sessionManager.activeSession;
    if (!session) return;
    const state = session.state;

    if (state.phase.kind === 'Ready' && readyHandledFor !== session.id) {
      readyHandledFor = session.id;
      runActionsWhenReady(state.button).catch(e => console.error('Failed to run connection actions', e));
    }

    if (state.isRunningActions && !runningRequestedActions) {
      runningRequestedActions = true;
      actionsContainer.runActionsForActionButton()
        .catch(e => console.error('Failed to run requested actions', e))
        .finally(() => {
          runningRequestedActions = false;
          session.endRunActions();
        });
    }
  });
}
