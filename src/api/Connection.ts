/// <reference types="web-bluetooth" />

import { CasioConstants } from '@api/CasioConstants';
import { progressEvents } from '@api/ProgressEvents';
import { watchInfo } from '@/api/WatchInfo';

class Connection {
  name: string;
  device: BluetoothDevice | null;
  server: BluetoothRemoteGATTServer | null;
  service: BluetoothRemoteGATTService | null;

  public connecting: boolean = false;
  private characteristicCache: Map<string, BluetoothRemoteGATTCharacteristic>;
  private dataReceivedCallback: ((receivedData: DataView, characteristicUuid: string) => void) | null = null;

  constructor() {
    this.name = "";
    this.device = null;
    this.server = null;
    this.service = null;
    this.characteristicCache = new Map();
  }

  start = async (): Promise<void> => {
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          {
            services: [CasioConstants.CASIO_SERVICE],
          },
        ],
        optionalServices: [
            CasioConstants.WATCH_FEATURES_SERVICE_UUID,
            CasioConstants.IMMEDIATE_ALERT_SERVICE_UUID,
            'battery_service',
            'device_information'
        ],
      });

      await this.initDevice(device);
    } catch (error) {
      console.error('Bluetooth error:', error);
    }
  };

  private initDevice = async (device: BluetoothDevice): Promise<void> => {
    if (this.isConnected() || this.connecting) return;

    this.connecting = true;

    try {
      this.device = device;
      
      const server = await device.gatt!.connect();
      this.server = server;

      // Small delay to allow the connection to stabilize
      await new Promise(resolve => setTimeout(resolve, 500));

      if (!server.connected) {
        throw new Error("GATT Server disconnected immediately after connect");
      }

      device.addEventListener('gattserverdisconnected', () => {
        this.device = null;
        this.server = null;
        this.service = null;
        this.characteristicCache.clear();
        progressEvents.onNext("Disconnected");
      });

      watchInfo.setNameAndModel(device.name!);

      try {
        this.service = await server.getPrimaryService(CasioConstants.WATCH_FEATURES_SERVICE_UUID);

        const characteristics = await this.service.getCharacteristics();
        for (const char of characteristics) {
            if (char.properties.notify || char.properties.indicate) {
                await char.startNotifications();
                char.addEventListener('characteristicvaluechanged', (event: Event) => {
                    const target = event.target as BluetoothRemoteGATTCharacteristic;
                    if (this.dataReceivedCallback && target.value) {
                        this.dataReceivedCallback(target.value, target.uuid);
                    }
                });
                console.log(`Subscribed to notifications: ${char.uuid}`);
            }
        }

        console.log(`Connected to ${device.name}`);
        progressEvents.onNext("Connected");
      } catch (e) {
        console.error("Failed to get services/characteristics", e);
        progressEvents.onNext("Connected");
      }
    } finally {
      this.connecting = false;
    }
  };

  stop = (): void => {
    if (this.device && this.device.gatt) {
      this.device.gatt.disconnect();
    }
    progressEvents.onNext("Disconnected");
  };

  write = async (handleOrUuid: string, value: any): Promise<void> => {
    if (this.service) {
      let characteristic = this.characteristicCache.get(handleOrUuid);
      if (!characteristic) {
        // handleOrUuid might be a short handle string like "26eb002d-..." or a full UUID.
        // It could also be a short handle ID from CasioIO.
        // We'll try to find it in the service if it looks like a UUID.
        try {
            characteristic = await this.service.getCharacteristic(handleOrUuid);
            this.characteristicCache.set(handleOrUuid, characteristic);
        } catch (e) {
            console.error(`Characteristic ${handleOrUuid} not found`);
            return;
        }
      }
      await characteristic.writeValue(new Uint8Array(value));
      console.log(`Write: ${handleOrUuid} | value: ${Array.from(new Uint8Array(value)).map(b => b.toString(16).padStart(2, '0')).join(' ')}`);
    }
  };

  setDataReceivedCallback = (callback: (receivedData: DataView, characteristicUuid: string) => void): void => {
    this.dataReceivedCallback = callback;
  };

  sendMessage = async (message: string): Promise<void> => {
    // Moved to GShockAPI or handled directly by IOs to avoid circular dependency
    console.warn("Connection.sendMessage is deprecated. Use MessageDispatcher directly if needed.");
  };

  isConnected = (): boolean => {
    return !!(this.device && this.device.gatt && this.device.gatt.connected);
  }
}

export const connection = new Connection();
