import { SignJWT, jwtVerify } from 'jose';
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { IUser } from '@/models/User';

// Clé secrète JWT (depuis .env)
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-change-in-production'
);

const JWT_ACCESS_EXPIRATION = '15m'; // 15 minutes
const JWT_REFRESH_EXPIRATION = '7d'; // 7 jours

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  type: 'access' | 'refresh';
}

/**
 * Génère un token JWT
 */
export async function generateToken(
  payload: Omit<JWTPayload, 'type'>,
  type: 'access' | 'refresh'
): Promise<string> {
  const expiration = type === 'access' ? JWT_ACCESS_EXPIRATION : JWT_REFRESH_EXPIRATION;

  return new SignJWT({ ...payload, type })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiration)
    .sign(JWT_SECRET);
}

/**
 * Vérifie et décode un token JWT
 */
export async function verifyToken(token: string): Promise<JWTPayload> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch (error) {
    throw new Error('Token invalide ou expiré');
  }
}

/**
 * Hash un mot de passe
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Vérifie un mot de passe
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Extrait le token depuis les headers de la requête
 */
export function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.split(' ')[1];
}

/**
 * Middleware : vérifie l'authentification et retourne le payload
 */
export async function requireAuth(request: NextRequest): Promise<JWTPayload> {
  const token = extractToken(request);
  if (!token) {
    throw new Error('Token manquant');
  }

  const payload = await verifyToken(token);

  if (payload.type !== 'access') {
    throw new Error('Type de token invalide');
  }

  return payload;
}

/**
 * Middleware : vérifie le rôle utilisateur
 */
export function requireRole(payload: JWTPayload, allowedRoles: string[]): void {
  if (!allowedRoles.includes(payload.role)) {
    throw new Error('Permissions insuffisantes');
  }
}

