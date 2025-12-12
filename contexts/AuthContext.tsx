"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, LoginCredentials, AuthResponse } from '@/types';
import { authApi } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Vérifie si l'utilisateur est déjà connecté au chargement
   */
  const refreshAuth = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      // TODO: Implémenter un endpoint /auth/me pour récupérer l'utilisateur actuel
      // Pour l'instant, on décode le token (temporaire)
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({
        _id: payload.userId,
        email: payload.email,
        role: payload.role,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Erreur de refresh auth:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  /**
   * Connexion
   */
  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response: AuthResponse = await authApi.login(credentials);
      setUser(response.user);
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Déconnexion
   */
  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook pour utiliser le contexte d'authentification
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
}

/**
 * Hook pour vérifier si l'utilisateur a un rôle spécifique
 */
export function useRequireRole(allowedRoles: string[]) {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated || !user) {
    return false;
  }
  
  return allowedRoles.includes(user.role);
}

/**
 * Hook pour vérifier si l'utilisateur est admin/superviseur
 */
export function useIsAdmin() {
  return useRequireRole(['SUPERVISOR']);
}
