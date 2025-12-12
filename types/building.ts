/**
 * Types pour les bâtiments
 */

export interface Building {
  _id: string;
  name: string;
  address?: string;
  totalFloors?: number;
  createdAt: string;
}

export interface CreateBuildingInput {
  name: string;
  address?: string;
  totalFloors?: number;
}

export interface UpdateBuildingInput {
  name?: string;
  address?: string;
  totalFloors?: number;
}

