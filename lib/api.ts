/**
 * Couche d'abstraction pour les appels API
 * Facilite l'utilisation des endpoints et centralise la gestion des erreurs
 */

import type {
  Room,
  CreateRoomInput,
  UpdateRoomInput,
  Device,
  CreateDeviceInput,
  UpdateDeviceInput,
  DeviceCommand,
  Building,
  CreateBuildingInput,
  UpdateBuildingInput,
  TelemetryData,
  LoginCredentials,
  AuthResponse,
  RegisterInput,
} from '@/types';
import { CommandType } from '@/types';

// =============================
// Configuration
// =============================

const API_BASE = '/api';

interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

/**
 * Fonction utilitaire pour gérer les appels API
 */
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Erreur HTTP: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Erreur API ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Ajoute le token d'authentification aux headers
 */
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// =============================
// AUTH API
// =============================

export const authApi = {
  /**
   * Connexion utilisateur
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetchApi<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // L'API retourne un format différent, on l'adapte
    const authResponse: AuthResponse = {
      user: {
        _id: response.user?.id || response.user?._id,
        email: response.user?.email,
        role: response.user?.role,
        firstName: response.user?.displayName?.split(' ')[0],
        lastName: response.user?.displayName?.split(' ')[1],
        createdAt: new Date().toISOString(),
      },
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    };

    // Stocker les tokens
    if (authResponse.accessToken) {
      localStorage.setItem('accessToken', authResponse.accessToken);
      localStorage.setItem('refreshToken', authResponse.refreshToken);
    }

    return authResponse;
  },

  /**
   * Inscription utilisateur
   */
  async register(data: RegisterInput): Promise<AuthResponse> {
    const response = await fetchApi<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.accessToken) {
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
    }

    return response;
  },

  /**
   * Déconnexion
   */
  async logout(): Promise<void> {
    try {
      await fetchApi('/auth/logout', {
        method: 'POST',
        headers: getAuthHeaders(),
      });
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },

  /**
   * Rafraîchir le token
   */
  async refreshToken(): Promise<{ accessToken: string }> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('Pas de refresh token disponible');
    }

    const response = await fetchApi<{ accessToken: string }>(
      '/auth/refresh',
      {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      }
    );

    if (response.accessToken) {
      localStorage.setItem('accessToken', response.accessToken);
    }

    return response;
  },
};

// =============================
// BUILDINGS API
// =============================

export const buildingsApi = {
  /**
   * Récupérer tous les bâtiments
   */
  async getAll(): Promise<Building[]> {
    const response = await fetchApi<ApiResponse<Building[]>>('/buildings');
    return response.data;
  },

  /**
   * Récupérer un bâtiment par ID
   */
  async getById(id: string): Promise<Building> {
    const response = await fetchApi<ApiResponse<Building>>(
      `/buildings/by-id/${id}`
    );
    return response.data;
  },

  /**
   * Créer un bâtiment
   */
  async create(data: CreateBuildingInput): Promise<Building> {
    const response = await fetchApi<ApiResponse<Building>>('/buildings', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  /**
   * Mettre à jour un bâtiment
   */
  async update(id: string, data: UpdateBuildingInput): Promise<Building> {
    const response = await fetchApi<ApiResponse<Building>>(
      `/buildings/by-id/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  },

  /**
   * Supprimer un bâtiment
   */
  async delete(id: string): Promise<void> {
    await fetchApi(`/buildings/by-id/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  },

  /**
   * Récupérer les statistiques d'un bâtiment
   */
  async getStats(id: string): Promise<any> {
    const response = await fetchApi<ApiResponse<any>>(
      `/buildings/by-id/${id}/stats`
    );
    return response.data;
  },
};

// =============================
// ROOMS API
// =============================

export const roomsApi = {
  /**
   * Récupérer toutes les salles
   */
  async getAll(): Promise<Room[]> {
    const response = await fetchApi<ApiResponse<Room[]>>('/rooms');
    return response.data;
  },

  /**
   * Récupérer une salle par ID
   */
  async getById(id: string): Promise<Room> {
    const response = await fetchApi<ApiResponse<Room>>(`/rooms/by-id/${id}`);
    return response.data;
  },

  /**
   * Récupérer les salles d'un bâtiment
   */
  async getByBuilding(buildingId: string): Promise<Room[]> {
    const response = await fetchApi<ApiResponse<Room[]>>(
      `/buildings/by-id/${buildingId}/rooms`
    );
    return response.data;
  },

  /**
   * Créer une salle
   */
  async create(data: CreateRoomInput): Promise<Room> {
    const response = await fetchApi<ApiResponse<Room>>('/rooms', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  /**
   * Mettre à jour une salle
   */
  async update(id: string, data: UpdateRoomInput): Promise<Room> {
    const response = await fetchApi<ApiResponse<Room>>(`/rooms/by-id/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  /**
   * Supprimer une salle
   */
  async delete(id: string): Promise<void> {
    await fetchApi(`/rooms/by-id/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  },

  /**
   * Récupérer les données d'une salle
   */
  async getData(id: string, limit?: number): Promise<any> {
    const url = `/rooms/by-id/${id}/data${limit ? `?limit=${limit}` : ''}`;
    const response = await fetchApi<any>(url);
    return response;
  },

  /**
   * Récupérer le statut d'une salle
   */
  async getStatus(id: string): Promise<any> {
    const response = await fetchApi<ApiResponse<any>>(
      `/rooms/by-id/${id}/status`
    );
    return response.data;
  },

  /**
   * Récupérer le statut de toutes les salles
   */
  async getAllStatus(): Promise<any> {
    const response = await fetchApi<ApiResponse<any>>('/rooms/status');
    return response.data;
  },
};

// =============================
// DEVICES API
// =============================

export const devicesApi = {
  /**
   * Récupérer tous les devices
   */
  async getAll(): Promise<Device[]> {
    const response = await fetchApi<ApiResponse<Device[]>>('/devices');
    return response.data;
  },

  /**
   * Récupérer un device par ID
   */
  async getById(id: string): Promise<Device> {
    const response = await fetchApi<ApiResponse<Device>>(
      `/devices/by-id/${id}`
    );
    return response.data;
  },

  /**
   * Récupérer un device par numéro de série
   */
  async getBySerial(serialNumber: string): Promise<Device> {
    const response = await fetchApi<ApiResponse<Device>>(
      `/devices/by-serial/${serialNumber}`
    );
    return response.data;
  },

  /**
   * Créer un device
   */
  async create(data: CreateDeviceInput): Promise<Device> {
    const response = await fetchApi<ApiResponse<Device>>('/devices', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  /**
   * Mettre à jour un device
   */
  async update(id: string, data: UpdateDeviceInput): Promise<Device> {
    const response = await fetchApi<ApiResponse<Device>>(
      `/devices/by-id/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  },

  /**
   * Supprimer un device
   */
  async delete(id: string): Promise<void> {
    await fetchApi(`/devices/by-id/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  },

  /**
   * Récupérer les données d'un device
   */
  async getData(
    id: string,
    params?: { limit?: number; from?: string; to?: string }
  ): Promise<TelemetryData[]> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.from) queryParams.append('from', params.from);
    if (params?.to) queryParams.append('to', params.to);

    const url = `/devices/by-id/${id}/data${queryParams.toString() ? `?${queryParams}` : ''}`;
    const response = await fetchApi<ApiResponse<TelemetryData[]>>(url);
    return response.data;
  },

  /**
   * Envoyer une commande à un device
   */
  async sendCommand(id: string, command: DeviceCommand): Promise<any> {
    const commandPath = command.command.toLowerCase().replace(/_/g, '-');
    const response = await fetchApi<ApiResponse<any>>(
      `/devices/by-id/${id}/commands/${commandPath}`,
      {
        method: 'POST',
        body: JSON.stringify(command.parameters || {}),
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  },

  /**
   * Redémarrer un device
   */
  async reboot(id: string): Promise<any> {
    return this.sendCommand(id, { deviceId: id, command: CommandType.REBOOT });
  },

  /**
   * Éteindre un device
   */
  async shutdown(id: string): Promise<any> {
    return this.sendCommand(id, { deviceId: id, command: CommandType.SHUTDOWN });
  },

  /**
   * Contrôler la LED d'un device
   */
  async setLed(id: string, state: 'on' | 'off'): Promise<any> {
    return this.sendCommand(id, {
      deviceId: id,
      command: CommandType.SET_LED_STATE,
      parameters: { state },
    });
  },
};

// =============================
// HISTORY API
// =============================

export const historyApi = {
  /**
   * Récupérer l'historique des logs
   */
  async getLogs(params?: { limit?: number; skip?: number }): Promise<any[]> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.skip) queryParams.append('skip', params.skip.toString());

    const url = `/history${queryParams.toString() ? `?${queryParams}` : ''}`;
    const response = await fetchApi<ApiResponse<any[]>>(url);
    return response.data;
  },
};

// =============================
// HEALTH API
// =============================

export const healthApi = {
  /**
   * Vérifier la santé de l'API
   */
  async check(): Promise<{ status: string; timestamp: string }> {
    return fetchApi('/health');
  },
};

// Export par défaut d'un objet contenant toutes les APIs
export default {
  auth: authApi,
  buildings: buildingsApi,
  rooms: roomsApi,
  devices: devicesApi,
  history: historyApi,
  health: healthApi,
};

