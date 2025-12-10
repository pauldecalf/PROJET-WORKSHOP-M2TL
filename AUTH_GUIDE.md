# 🔐 Guide d'authentification JWT

Ce guide explique comment utiliser le système d'authentification JWT de l'API.

---

## 📖 Vue d'ensemble

L'API utilise **JSON Web Tokens (JWT)** pour sécuriser les routes.

### Types de tokens

1. **Access Token** : 
   - Durée : 15 minutes
   - Usage : Requêtes API
   - Header : `Authorization: Bearer <accessToken>`

2. **Refresh Token** :
   - Durée : 7 jours
   - Usage : Renouveler l'access token
   - Stocké : localStorage ou httpOnly cookie

---

## 🚀 Flux d'authentification

### 1. Connexion

**Endpoint** : `POST /api/auth/login`

**Body** :
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Réponse** (200 OK) :
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "admin@example.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "SUPERVISOR"
  }
}
```

**Erreurs** :
- `400` : Email ou password manquant
- `401` : Identifiants invalides

---

### 2. Utilisation du token

Ajoutez le header `Authorization` à toutes vos requêtes :

```bash
curl http://localhost:3000/api/devices \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Avec fetch (JavaScript)** :
```javascript
const response = await fetch('http://localhost:3000/api/devices', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

---

### 3. Rafraîchir le token

Quand l'access token expire (après 15 min), utilisez le refresh token :

**Endpoint** : `POST /api/auth/refresh`

**Body** :
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Réponse** (200 OK) :
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Erreurs** :
- `400` : Refresh token manquant
- `401` : Refresh token invalide ou expiré

---

### 4. Déconnexion

**Endpoint** : `POST /api/auth/logout`

**Réponse** (200 OK) :
```json
{
  "success": true,
  "message": "Déconnexion réussie. Supprimez le token côté client."
}
```

**⚠️ Important** : Avec JWT stateless, la déconnexion se fait **côté client** en supprimant les tokens du localStorage/sessionStorage.

---

## 💻 Implémentation Frontend

### React / Next.js (avec Context API)

```typescript
// context/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  // Charger les tokens depuis localStorage au montage
  useEffect(() => {
    const storedAccessToken = localStorage.getItem('accessToken');
    const storedRefreshToken = localStorage.getItem('refreshToken');
    const storedUser = localStorage.getItem('user');

    if (storedAccessToken && storedRefreshToken && storedUser) {
      setAccessToken(storedAccessToken);
      setRefreshToken(storedRefreshToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Login
  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    const data = await response.json();

    // Stocker les tokens
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));

    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    setUser(data.user);
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  // Rafraîchir le token automatiquement
  useEffect(() => {
    if (!refreshToken) return;

    // Rafraîchir toutes les 14 minutes (avant expiration à 15 min)
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (response.ok) {
          const data = await response.json();
          setAccessToken(data.accessToken);
          localStorage.setItem('accessToken', data.accessToken);
        } else {
          // Refresh token expiré -> logout
          logout();
        }
      } catch (error) {
        console.error('Failed to refresh token:', error);
        logout();
      }
    }, 14 * 60 * 1000); // 14 minutes

    return () => clearInterval(interval);
  }, [refreshToken]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### Hook personnalisé pour les requêtes API

```typescript
// hooks/useApi.ts
import { useAuth } from '@/context/AuthContext';

export function useApi() {
  const { accessToken, logout } = useAuth();

  const fetcher = async (url: string, options: RequestInit = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401) {
      // Token expiré -> logout
      logout();
      throw new Error('Session expirée');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur API');
    }

    return response.json();
  };

  return { fetcher };
}
```

### Exemple d'utilisation

```typescript
// pages/devices.tsx
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';

export default function DevicesPage() {
  const { isAuthenticated } = useAuth();
  const { fetcher } = useApi();
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) return;

    fetcher('/api/devices')
      .then(data => setDevices(data.data))
      .catch(error => console.error(error));
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <div>Veuillez vous connecter</div>;
  }

  return (
    <div>
      <h1>Devices</h1>
      <ul>
        {devices.map(device => (
          <li key={device._id}>{device.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 🔒 Sécurité : Bonnes pratiques

### 1. Stockage des tokens

**❌ Ne JAMAIS faire** :
- Stocker dans un cookie sans `httpOnly`
- Stocker dans une variable globale
- Envoyer le refresh token dans l'URL

**✅ Recommandé** :
- **localStorage** : Simple mais vulnérable aux attaques XSS
- **httpOnly cookie** : Plus sécurisé (pas accessible en JS)
- **sessionStorage** : Tokens supprimés à la fermeture de l'onglet

### 2. HTTPS obligatoire en production

Toujours utiliser HTTPS pour éviter l'interception des tokens.

### 3. Variables d'environnement

```env
# .env.local
JWT_SECRET=votre-secret-ultra-securise-minimum-32-caracteres-changez-moi
```

**⚠️ JAMAIS commit ce fichier !**

### 4. Rotation des tokens

Le refresh token permet de régénérer l'access token sans re-login. En production, considérez :

- **Refresh token rotation** : Générer un nouveau refresh token à chaque rafraîchissement
- **Blacklist des refresh tokens** : Utiliser Redis pour révoquer les tokens (logout côté serveur)

---

## 🛠️ Backend : Protéger une route

### Option 1 : Inline dans chaque route

```typescript
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const payload = await requireAuth(request);
    
    // payload contient : { userId, email, role, type: 'access' }
    
    // Votre logique ici
    const devices = await Device.find({ userId: payload.userId });
    
    return NextResponse.json({ success: true, data: devices });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 401 }
    );
  }
}
```

### Option 2 : Middleware global (Next.js 13+)

Créez `middleware.ts` à la racine :

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  // Routes publiques (pas d'auth requise)
  const publicRoutes = [
    '/api/auth/login',
    '/api/auth/refresh',
    '/api/public',
    '/api/health',
  ];

  if (publicRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Vérifier le token
  const token = request.headers.get('authorization')?.split(' ')[1];

  if (!token) {
    return NextResponse.json(
      { success: false, error: 'Token manquant' },
      { status: 401 }
    );
  }

  try {
    const payload = await verifyToken(token);

    // Ajouter les infos user aux headers (accessible dans les routes)
    const response = NextResponse.next();
    response.headers.set('x-user-id', payload.userId);
    response.headers.set('x-user-role', payload.role);

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Token invalide' },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: '/api/:path*',
};
```

---

## 🧪 Tester l'authentification

### 1. Créer un utilisateur de test

Avec le script seed :

```bash
npm run seed
```

Ou manuellement via MongoDB :

```javascript
const bcrypt = require('bcryptjs');

db.users.insertOne({
  email: 'test@example.com',
  passwordHash: await bcrypt.hash('password123', 10),
  firstName: 'Test',
  lastName: 'User',
  role: 'SUPERVISOR',
  createdAt: new Date(),
});
```

### 2. Test avec cURL

```bash
# 1. Login
ACCESS_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  | jq -r '.accessToken')

# 2. Utiliser le token
curl http://localhost:3000/api/devices \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# 3. Refresh
REFRESH_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  | jq -r '.refreshToken')

curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}"
```

### 3. Test avec Swagger UI

1. Allez sur http://localhost:3000/api-docs
2. Cliquez sur `POST /api/auth/login`
3. Cliquez sur "Try it out"
4. Entrez vos identifiants
5. Copiez l'`accessToken`
6. Cliquez sur le bouton "Authorize" 🔒 en haut
7. Collez le token (format : `Bearer <token>`)
8. Testez les autres routes !

---

## ❓ FAQ

### Pourquoi deux tokens ?

- **Access Token** : Court (15 min) pour limiter les risques si compromis
- **Refresh Token** : Long (7 jours) pour éviter de re-login trop souvent

### Que se passe-t-il si le refresh token expire ?

L'utilisateur doit se reconnecter via `/api/auth/login`.

### Comment révoquer un token ?

Avec JWT stateless, on ne peut pas "révoquer" un token côté serveur. Solutions :

1. **Blacklist avec Redis** : Stocker les tokens révoqués
2. **Rotation des secrets** : Changer `JWT_SECRET` (révoque TOUS les tokens)
3. **Durée courte** : Access token de 15 min limite les dégâts

### Peut-on utiliser NextAuth.js à la place ?

Oui ! NextAuth.js est une excellente alternative si vous préférez une solution clé-en-main.

---

## 📚 Ressources

- [JWT.io](https://jwt.io/) : Débugger vos tokens
- [OWASP JWT Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- [Next.js Auth](https://nextjs.org/docs/app/building-your-application/authentication)
- [jose library](https://github.com/panva/jose) : JWT pour Edge Runtime

---

## 🚀 Prêt pour la production !

✅ JWT sécurisé avec `jose`  
✅ Hashing bcrypt  
✅ Access + Refresh tokens  
✅ Middleware d'authentification  
✅ Gestion des rôles (SUPERVISOR, STUDENT)  

**Prochaine étape** : Ajouter un middleware global pour protéger toutes les routes sensibles automatiquement ! 🔒

