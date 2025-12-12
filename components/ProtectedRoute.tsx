"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  redirectTo?: string;
}

/**
 * Composant pour protéger les routes qui nécessitent une authentification
 */
export function ProtectedRoute({
  children,
  requiredRoles = [],
  redirectTo = '/admin/login',
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Si pas authentifié, rediriger vers la page de connexion
    if (!isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    // Si des rôles sont requis et l'utilisateur n'a pas le bon rôle
    if (requiredRoles.length > 0 && user && !requiredRoles.includes(user.role)) {
      router.push('/'); // Rediriger vers l'accueil
    }
  }, [isAuthenticated, isLoading, user, requiredRoles, router, redirectTo]);

  // Afficher un loader pendant la vérification
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Si pas authentifié, ne rien afficher (la redirection est en cours)
  if (!isAuthenticated) {
    return null;
  }

  // Si rôles requis et utilisateur n'a pas le bon rôle
  if (requiredRoles.length > 0 && user && !requiredRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}

