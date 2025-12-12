/**
 * Types pour les salles (Rooms)
 */

import { RoomAvailability } from './enums';

// Alias pour compatibilité
export type RoomStatus = 'AVAILABLE' | 'OCCUPIED' | 'UNKNOWN';

export interface Room {
  _id: string;
  buildingId: {
    _id: string;
    name: string;
    address?: string;
  };
  name: string;
  floor?: number;
  capacity?: number;
  mapX?: number;
  mapY?: number;
  currentStatus?: RoomStatus;
  createdAt: string;
}

export interface RoomWithLatestData extends Room {
  latestData?: {
    temperature?: number;
    humidity?: number;
    co2?: number;
    decibel?: number;
    luminosity?: number;
    measuredAt?: string;
  };
}

export interface CreateRoomInput {
  buildingId: string;
  name: string;
  floor?: number;
  capacity?: number;
}

export interface UpdateRoomInput {
  name?: string;
  floor?: number;
  capacity?: number;
  currentStatus?: RoomStatus;
}

