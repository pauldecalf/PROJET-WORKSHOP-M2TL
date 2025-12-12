/**
 * Types pour l'authentification
 */

import { UserRole } from './enums';

export interface User {
  _id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
}

