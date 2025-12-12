/**
 * Types pour les devices IoT
 */

import { DeviceStatus, DeviceConfigStatus, CommandType } from './enums';

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

