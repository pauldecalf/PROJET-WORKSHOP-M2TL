/**
 * Types pour les devices IoT
 */

export interface Device {
  _id: string;
  serialNumber: string;
  name?: string;
  roomId?: {
    _id: string;
    name: string;
    buildingId?: {
      _id: string;
      name: string;
    };
  } | string;
  badgeId?: string;
  status: DeviceStatus;
  configStatus: DeviceConfigStatus;
  firmwareVersion?: string;
  batteryLevel?: number;
  isPoweredOn: boolean;
  lastSeenAt?: string;
  createdAt: string;
}

export type DeviceStatus = 'ONLINE' | 'OFFLINE' | 'ERROR' | 'UNKNOWN';

export type DeviceConfigStatus = 
  | 'PENDING' 
  | 'IN_PROGRESS' 
  | 'CONFIGURED' 
  | 'SCAN_BY_CARD';

export interface CreateDeviceInput {
  serialNumber: string;
  name?: string;
  roomId?: string;
}

export interface UpdateDeviceInput {
  name?: string;
  roomId?: string;
  status?: DeviceStatus;
  configStatus?: DeviceConfigStatus;
  batteryLevel?: number;
  isPoweredOn?: boolean;
}

export interface DeviceCommand {
  deviceId: string;
  command: CommandType;
  parameters?: Record<string, any>;
}

export type CommandType = 
  | 'SET_SAMPLING_INTERVAL'
  | 'SET_VISIBILITY'
  | 'TURN_OFF'
  | 'TURN_ON'
  | 'SET_LED_STATE'
  | 'REBOOT'
  | 'SHUTDOWN';

