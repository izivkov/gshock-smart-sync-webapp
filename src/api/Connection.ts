/// <reference types="web-bluetooth" />

import { CasioConstants } from '@api/CasioConstants';
import { progressEvents } from '@api/ProgressEvents';
import { watchInfo } from '@/api/WatchInfo';
import { messageDispatcher } from '@api/MessageDispatcher';

class Connection {
  name: string;
  device: BluetoothDevice | null;
  server: BluetoothRemoteGATTServer | null;
  service: BluetoothRemoteGATTService | null;
  readCharacteristic: BluetoothRemoteGATTCharacteristic | null;
  writeCharacteristic: BluetoothRemoteGATTCharacteristic | null;
  writeCharacteristicSetValue: BluetoothRemoteGATTCharacteristic | null;
  notifyCharacteristic: BluetoothRemoteGATTCharacteristic | null;

  public connecting: boolean = false;
  private characteristicCache: Map<string, BluetoothRemoteGATTCharacteristic>;

  constructor() {
    this.name = "";
    this.device = null;
    this.server = null;
    this.service = null;
    this.readCharacteristic = null;
    this.writeCharacteristic = null;
    this.writeCharacteristicSetValue = null;
    this.notifyCharacteristic = null;
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
      
      // Connect to the device
      const server = await device.gatt!.connect();
      this.server = server;

      // Wait 1 second for the GATT connection and encryption to settle
      await new Promise(resolve => setTimeout(resolve, 1000));

      device.addEventListener('gattserverdisconnected', () => {
        this.device = null;
        this.server = null;
        this.service = null;
        this.readCharacteristic = null;
        this.writeCharacteristic = null;
        this.writeCharacteristicSetValue = null;
        this.notifyCharacteristic = null;

        this.characteristicCache.clear();

        progressEvents.onNext("Disconnected");
      });

      watchInfo.setNameAndModel(device.name!);

      try {
        this.service = await server.getPrimaryService(CasioConstants.WATCH_FEATURES_SERVICE_UUID);

        // Enable notifications for a characteristic
        this.notifyCharacteristic = await this.service.getCharacteristic(CasioConstants.CASIO_ALL_FEATURES_CHARACTERISTIC_UUID);
        await this.notifyCharacteristic.startNotifications();

        console.log(`Connected to ${device.name}`);
        progressEvents.onNext("Connected");
      } catch (e) {
        console.error("Failed to get services/characteristics", e);
        // Even if characteristics fail, we are connected at the GATT level
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

  write = async (handle: BluetoothCharacteristicUUID, value: any): Promise<void> => {
    if (this.service) {
      let characteristic = this.characteristicCache.get(handle.toString());
      if (!characteristic) {
        characteristic = await this.service.getCharacteristic(handle);
        this.characteristicCache.set(handle.toString(), characteristic);
      }
      await characteristic.writeValue(new Uint8Array(value));
      console.log(`Write: ${handle} | value: ${value.toString(16)}`);
    }
  };

  request = async (request: number[]): Promise<void> => {
    const REQUEST_HANDLE_ID = 0xC;
    await this.write(REQUEST_HANDLE_ID.toString(), request);
  };

  setDataReceivedCallback = (callback: (receivedData: DataView) => void): void => {
    if (this.notifyCharacteristic) {
      this.notifyCharacteristic.addEventListener('characteristicvaluechanged', (event: Event) => {
        const target = event.target as BluetoothRemoteGATTCharacteristic;
        const receivedData = target!.value;
        callback(receivedData!);
      });
    }
  };

  sendMessage = async (message: string): Promise<void> => {
    await messageDispatcher.sendToWatch(message);
  };

  isExperimentalFeatureEnabled = (): boolean => {
    // Check if the Web Bluetooth API is available
    if ('bluetooth' in navigator && 'Bluetooth' in window) {
      // Web Bluetooth API is available, so it's likely that experimental features are enabled
      return true;
    } else {
      // Web Bluetooth API is not available, indicating experimental features are not enabled
      return false;
    }
  }

  isConnected = (): boolean => {
    if (this.device) {
      return this.device.gatt!.connected;
    } else {
      return false;
    }
  }
}

export const connection = new Connection();

/*
Read request:  26eb002c-b012-49a8-b1f8-394fb2032b0f | value: 0x10
Write request: 26eb002d-b012-49a8-b1f8-394fb2032b0f | value: 0x18 00 04 0A 00 00 00
*/
