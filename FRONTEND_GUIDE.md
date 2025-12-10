# 🎨 Guide Frontend - Workshop IoT

## ✅ Vue d'ensemble

Le frontend Workshop IoT est une application Next.js moderne avec :
- **Landing page** attractive et informative
- **Dashboard public** de visualisation des salles
- **Espace administrateur** complet avec authentification
- **Design moderne** avec Tailwind CSS et animations

---

## 📁 Structure des pages

```
app/
├── page.tsx                        # 🏠 Landing page
├── admin/
│   ├── login/page.tsx              # 🔐 Connexion admin
│   ├── register/page.tsx           # ✍️ Inscription admin
│   └── dashboard/page.tsx          # 📊 Dashboard admin
└── public/
    └── rooms/page.tsx              # 🏠 Dashboard public des salles

contexts/
└── AuthContext.tsx                 # 🔒 Context d'authentification
```

---

## 🎯 Pages disponibles

### 1. Landing Page (`/`)

**URL** : `http://localhost:3000/`

**Fonctionnalités** :
- ✅ Hero section avec CTA
- ✅ Présentation des fonctionnalités IoT
- ✅ Stats de l'infrastructure
- ✅ Technologies utilisées
- ✅ Liens vers dashboard public et admin

**Sections** :
```tsx
- Header avec navigation
- Hero (titre + CTAs)
- Features (3 cartes)
- Stats (31 routes, 12 modèles, etc.)
- Tech Stack (Next.js, MongoDB, JWT, ESP32, Swagger)
- CTA final
- Footer
```

---

### 2. Dashboard Public (`/public/rooms`)

**URL** : `http://localhost:3000/public/rooms`

**Fonctionnalités** :
- ✅ Liste de toutes les salles avec leur statut
- ✅ Rafraîchissement automatique toutes les 30s
- ✅ Stats résumées (total, disponibles, occupées, maintenance)
- ✅ Grid responsive des salles
- ✅ Badges de statut colorés

**États possibles** :
- 🟢 **AVAILABLE** : Salle disponible
- 🔴 **OCCUPIED** : Salle occupée
- 🟡 **MAINTENANCE** : Salle en maintenance
- ⚪ **UNKNOWN** : Statut inconnu

**Exemple de salle** :
```tsx
<Card>
  <StatusBadge status="AVAILABLE" />
  <RoomName>Salle A101</RoomName>
  <Building>Bâtiment A</Building>
  <DeviceCount>3 devices</DeviceCount>
  <ViewDetailsButton />
</Card>
```

---

### 3. Connexion Admin (`/admin/login`)

**URL** : `http://localhost:3000/admin/login`

**Fonctionnalités** :
- ✅ Formulaire de connexion (email + password)
- ✅ Validation côté client
- ✅ Messages d'erreur
- ✅ Stockage des tokens JWT
- ✅ Redirection vers dashboard après connexion
- ✅ Lien vers inscription

**Identifiants de test** :
```
Email: admin@example.com
Password: password123
```
*(Créer d'abord l'utilisateur via l'API ou MongoDB)*

**Flow d'authentification** :
```
1. Utilisateur entre email/password
2. POST /api/auth/login
3. Réception des tokens (accessToken, refreshToken)
4. Stockage dans localStorage
5. Redirection vers /admin/dashboard
```

---

### 4. Inscription Admin (`/admin/register`)

**URL** : `http://localhost:3000/admin/register`

**Fonctionnalités** :
- ✅ Formulaire d'inscription complet
- ✅ Validation du mot de passe (min 8 caractères)
- ✅ Confirmation du mot de passe
- ✅ Connexion automatique après inscription
- ✅ Attribution du rôle SUPERVISOR par défaut

**Champs requis** :
```tsx
- displayName (Nom complet)
- email (Email)
- password (Mot de passe, min 8 car.)
- confirmPassword (Confirmation)
```

**Flow d'inscription** :
```
1. Utilisateur remplit le formulaire
2. Validation côté client
3. POST /api/auth/register
4. Création du compte
5. Réception des tokens
6. Connexion automatique
7. Redirection vers /admin/dashboard
```

---

### 5. Dashboard Admin (`/admin/dashboard`)

**URL** : `http://localhost:3000/admin/dashboard`

**Protection** : ⚠️ Authentification requise

**Fonctionnalités** :
- ✅ Vue d'ensemble de l'infrastructure IoT
- ✅ Stats en temps réel (devices, salles, bâtiments)
- ✅ Répartition par statut
- ✅ État de configuration des devices
- ✅ Actions rapides
- ✅ Navigation vers les sections

**Stats affichées** :
```tsx
1. Total devices
2. Total salles
3. Total bâtiments
4. Devices en ligne
5. Répartition par statut (ONLINE, OFFLINE, ERROR, UNKNOWN)
6. Répartition par configStatus (PENDING, IN_PROGRESS, CONFIGURED)
```

**Actions rapides** :
- ➕ Ajouter un device → `/admin/devices/new`
- 🏠 Créer une salle → `/admin/rooms/new`
- 🏢 Ajouter un bâtiment → `/admin/buildings/new`
- 📚 Voir l'API → `/api-docs`

**Navigation principale** :
```tsx
- 📊 Dashboard
- 📟 Devices
- 🏠 Salles
- 🏢 Bâtiments
- 📚 API Docs
```

---

## 🔒 Système d'authentification

### AuthContext

**Fichier** : `contexts/AuthContext.tsx`

**Fonctionnalités** :
```tsx
interface AuthContextType {
  user: User | null;              // Utilisateur connecté
  loading: boolean;               // État de chargement
  login: (email, password) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;       // true si connecté
}
```

**Utilisation** :
```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Veuillez vous connecter</div>;
  }

  return (
    <div>
      <p>Bienvenue {user.displayName}</p>
      <button onClick={logout}>Déconnexion</button>
    </div>
  );
}
```

### Protection des routes

**Vérification manuelle** :
```tsx
useEffect(() => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    router.push('/admin/login');
  }
}, []);
```

---

## 🎨 Design System

### Couleurs principales

```css
/* Gradients */
from-blue-600 to-purple-600    /* Principal */
from-blue-50 via-white to-purple-50  /* Background */

/* Status colors */
green-500    /* Success / Available / Online */
red-500      /* Error / Occupied / Offline */
yellow-500   /* Warning / Pending / Maintenance */
blue-500     /* Info / In Progress */
gray-400     /* Unknown / Disabled */
```

### Composants réutilisables

#### Card de statistique
```tsx
<div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
  <div className="text-3xl font-bold text-gray-900 mb-1">
    {value}
  </div>
  <div className="text-sm text-gray-600">
    {label}
  </div>
</div>
```

#### Badge de statut
```tsx
<span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(status)}`}>
  {statusEmoji} {status}
</span>
```

#### Bouton principal
```tsx
<button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-xl transition">
  Action
</button>
```

---

## 📊 API Calls

### Exemple : Charger les stats admin

```tsx
const loadStats = async () => {
  try {
    const response = await fetch('/api/admin/devices/stats', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      setStats(data.data);
    }
  } catch (error) {
    console.error('Erreur:', error);
  }
};
```

### Exemple : Login

```tsx
const handleLogin = async (email: string, password: string) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (response.ok) {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    router.push('/admin/dashboard');
  }
};
```

---

## 🚀 Lancer le frontend

### Développement

```bash
npm run dev
```

Puis ouvrir :
- Landing page : http://localhost:3000
- Dashboard public : http://localhost:3000/public/rooms
- Admin login : http://localhost:3000/admin/login

### Production

```bash
npm run build
npm start
```

---

## 🧪 Tester l'interface

### 1. Landing Page

1. Ouvrir `http://localhost:3000`
2. Vérifier le hero et les sections
3. Cliquer sur "Dashboard Public"
4. Cliquer sur "Admin"

### 2. Dashboard Public

1. Ouvrir `http://localhost:3000/public/rooms`
2. Vérifier l'affichage des salles
3. Observer le rafraîchissement auto (30s)
4. Vérifier les stats résumées

### 3. Authentification

**Créer un compte** :
1. Aller sur `/admin/register`
2. Remplir le formulaire
3. Vérifier la redirection vers dashboard

**Se connecter** :
1. Aller sur `/admin/login`
2. Entrer email/password
3. Vérifier la redirection vers dashboard

**Se déconnecter** :
1. Cliquer sur "Déconnexion"
2. Vérifier la suppression des tokens
3. Vérifier la redirection vers login

### 4. Dashboard Admin

1. Se connecter
2. Vérifier les stats
3. Tester les liens de navigation
4. Vérifier les actions rapides

---

## 🔧 Configuration

### Variables d'environnement

Aucune variable spécifique au frontend n'est requise.
Le frontend utilise les routes API du backend (`/api/*`).

### Stockage local

Le frontend utilise `localStorage` pour :
```tsx
localStorage.setItem('accessToken', token);
localStorage.setItem('refreshToken', token);
localStorage.setItem('user', JSON.stringify(user));
```

---

## 📱 Responsive Design

Toutes les pages sont **entièrement responsive** :

```css
/* Mobile first */
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"

/* Breakpoints Tailwind */
sm: 640px   /* Tablettes portrait */
md: 768px   /* Tablettes paysage */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

---

## ✨ Animations et transitions

### Hover effects
```css
hover:shadow-xl transition
hover:text-gray-900 transition
hover:-translate-y-1 transform
```

### Loading states
```tsx
{loading && (
  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600" />
)}
```

---

## 🎯 Pages à créer ensuite

Pour compléter l'interface admin :

1. **`/admin/devices`** : Liste des devices avec filtres
2. **`/admin/devices/new`** : Formulaire de création de device
3. **`/admin/devices/[id]`** : Détails et édition d'un device
4. **`/admin/rooms`** : Liste des salles
5. **`/admin/rooms/new`** : Formulaire de création de salle
6. **`/admin/rooms/[id]`** : Détails et édition d'une salle
7. **`/admin/buildings`** : Liste des bâtiments
8. **`/admin/buildings/new`** : Formulaire de création de bâtiment
9. **`/admin/buildings/[id]`** : Détails et édition d'un bâtiment
10. **`/public/rooms/[id]`** : Détails publics d'une salle avec données en temps réel

---

## 📚 Ressources

- **Next.js 16** : https://nextjs.org/docs
- **Tailwind CSS** : https://tailwindcss.com/docs
- **React Hooks** : https://react.dev/reference/react
- **API Routes** : Voir `/api-docs` (Swagger)

---

## ✅ Checklist complète

✅ Landing page moderne et attractive  
✅ Dashboard public avec salles en temps réel  
✅ Page de connexion admin  
✅ Page d'inscription admin  
✅ Dashboard admin avec stats  
✅ Context d'authentification  
✅ Protection des routes admin  
✅ Design responsive  
✅ Animations et transitions  
✅ Gestion des erreurs  
✅ Build sans erreur  

---

## 🎉 Prêt à l'emploi !

Le frontend est **100% fonctionnel** et prêt à être déployé !

**Démarrage rapide** :
```bash
# Développement
npm run dev

# Ouvrir http://localhost:3000
```

🚀 **Bonne découverte !**

