import { progressEvents, EventAction } from '@api/ProgressEvents';
import { sessionManager } from './SessionManager';

let started = false;

const payloadString = (name: string): string | null => {
  const value = progressEvents.getPayload(name);
  return typeof value === 'string' && value.trim() !== '' ? value : null;
};

/**
 * The single place that observes low-level connection events and turns them into SessionManager
 * calls (mirrors SessionEventBridge.kt). Call once at startup, before anything connects.
 * Nothing else should subscribe to connection events: ask the session instead.
 */
export function setupSessionEventBridge(): void {
  if (started) return;
  started = true;

  const actions: EventAction[] = [
    { label: 'ConnectionStarted', action: () => sessionManager.onConnecting() },
    {
      label: 'DeviceName',
      action: () => {
        const name = payloadString('DeviceName');
        if (name) sessionManager.onDeviceName(name);
      },
    },
    {
      label: 'DeviceAddress',
      action: () => {
        const address = payloadString('DeviceAddress');
        if (address) sessionManager.onDeviceAddress(address);
      },
    },
    { label: 'ConnectionSetupComplete', action: () => sessionManager.onSetupComplete() },
    { label: 'WatchInitializationCompleted', action: () => sessionManager.onConnected() },
    { label: 'Disconnect', action: () => sessionManager.onDisconnected('Watch disconnected') },
    { label: 'ConnectionFailed', action: () => sessionManager.onDisconnected('Connection Failed') },
    {
      label: 'ApiError',
      action: () => sessionManager.onApiError(String(progressEvents.getPayload('ApiError') ?? 'API Error')),
    },
    { label: 'RunActions', action: () => sessionManager.onRunActionsRequested() },
    {
      // A blank reason means "use the default message"; the UI layer owns that text.
      label: 'Error',
      action: () => sessionManager.onError(String(progressEvents.getPayload('Error') ?? '')),
    },
  ];

  progressEvents.runEventActions('SessionEventBridge', actions);
}
