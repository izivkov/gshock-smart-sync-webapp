/// <reference types="web-bluetooth" />

import { CasioConstants } from '@api/CasioConstants';
import { progressEvents } from '@api/ProgressEvents';
import { watchInfo } from '@api/Watchinfo';
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

  constructor() {
    this.name = "";
    this.device = null;
    this.server = null;
    this.service = null;
    this.readCharacteristic = null;
    this.writeCharacteristic = null;
    this.writeCharacteristicSetValue = null;
    this.notifyCharacteristic = null;
  }

  start = async (): Promise<void> => {

    const isExperimentalFeatureEnabled = this.isExperimentalFeatureEnabled();
    console.log("Bluetooth is experimental feature enabled: " + isExperimentalFeatureEnabled);

    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          {
            services: [
              CasioConstants.CASIO_SERVICE,
              // CasioConstants.WATCH_FEATURES_SERVICE_UUID,
            ],
          },
        ],
        optionalServices: [CasioConstants.WATCH_FEATURES_SERVICE_UUID],
      });

      // Connect to the device
      const server = await device.gatt!.connect();

      watchInfo.setNameAndModel(device.name!);

      this.service = await server.getPrimaryService(CasioConstants.WATCH_FEATURES_SERVICE_UUID);

      // Enable notifications for a characteristic (if needed)
      this.notifyCharacteristic = await this.service.getCharacteristic(CasioConstants.CASIO_ALL_FEATURES_CHARACTERISTIC_UUID);
      await this.notifyCharacteristic.startNotifications();

      console.log(`Connected to ${device.name}`);
      progressEvents.onNext("Connected");

    } catch (error) {
      console.error('Bluetooth error:', error);
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
      const service = await this.service.getCharacteristic(handle);
      await service.writeValue(new Uint8Array(value));
      console.log(`Write: ${handle} | value: ${value.toString(16)}`);
    }
  };

  request = async (request: number[]): Promise<void> => {
    this.write(0xC.toString(), request);
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
}

export const connection = new Connection();

/*
Read request:  26eb002c-b012-49a8-b1f8-394fb2032b0f | value: 0x10
Write request: 26eb002d-b012-49a8-b1f8-394fb2032b0f | value: 0x18 00 04 0A 00 00 00
*/
