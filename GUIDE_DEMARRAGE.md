# 🚀 Guide de Démarrage Rapide

## ✅ Ce qui a été créé

### 📁 Structure des types TypeScript
- ✅ `types/auth.ts` - Types authentification (User, LoginCredentials, etc.)
- ✅ `types/building.ts` - Types bâtiments
- ✅ `types/device.ts` - Types devices IoT
- ✅ `types/room.ts` - Types salles
- ✅ `types/telemetry.ts` - Types données capteurs + fonctions utilitaires
- ✅ `types/index.ts` - Export centralisé

### 🔌 Couche API
- ✅ `lib/api.ts` - Abstraction complète des appels API
  - `authApi` - Connexion, déconnexion, refresh token
  - `buildingsApi` - CRUD bâtiments
  - `roomsApi` - CRUD salles + données
  - `devicesApi` - CRUD devices + commandes (shutdown, reboot, LED)
  - `historyApi` - Logs d'audit
  - `healthApi` - Health check

### 🔐 Système d'authentification
- ✅ `contexts/AuthContext.tsx` - Context React pour l'auth
  - Hook `useAuth()` - Accès user, login, logout
  - Hook `useIsAdmin()` - Vérification rôle admin
- ✅ `components/ProtectedRoute.tsx` - Protection des routes admin
- ✅ Token JWT stocké dans localStorage
- ✅ Refresh automatique du token

### 🎨 Pages et composants

#### Page publique
- ✅ `app/page.tsx` refactorisée avec :
  - Hero section moderne avec présentation projet
  - Cards de features (Temps Réel, Capteurs IoT)
  - Liste des salles avec filtres avancés
  - Bouton "Connexion administrateur" bien visible
  - Graphiques de tendances par salle

#### Espace admin
- ✅ `app/admin/login/page.tsx` - Page de connexion moderne
  - Formulaire stylisé
  - Gestion des erreurs
  - Redirection automatique si déjà connecté
  - Lien retour accueil
- ✅ `app/admin/page.tsx` - Dashboard admin protégé
  - Protection par rôle SUPERVISOR
  - Toutes les fonctionnalités existantes préservées

#### Layout et navigation
- ✅ `app/layout.tsx` - AuthProvider intégré
- ✅ `components/AppLayout.tsx` amélioré avec :
  - Menu utilisateur avec avatar
  - Bouton de déconnexion
  - Navigation conditionnelle (admin visible seulement si connecté)
  - Gestion spéciale pour la page de login (pas de sidebar)

### 🪝 Hooks personnalisés
- ✅ `hooks/useRoomData.ts`
  - `useRoomLatest(roomId)` - Dernières données d'une salle
  - `useRoomSeries(roomId)` - Séries temporelles
  - `mapLuminosityToAvailability()` - Calcul disponibilité

### 📚 Documentation
- ✅ `FRONTEND_README.md` - Documentation complète du frontend
- ✅ `GUIDE_DEMARRAGE.md` - Ce guide

## 🎯 Comment tester

### 0. Créer l'utilisateur admin (IMPORTANT)

**Avant de tester, créez l'utilisateur admin :**

```bash
npm run create-admin
```

Cette commande va créer l'utilisateur `admin@campus.fr` avec le mot de passe `admin123`.

### 1. Vérifier que le serveur fonctionne

```bash
npm run dev
```

### 2. Tester l'espace public

Ouvrir http://localhost:3000

**Ce que vous devriez voir :**
- ✅ Hero section avec titre "Supervision IoT des Salles de Campus"
- ✅ 2 features cards (Temps Réel, Capteurs IoT)
- ✅ Bouton "Connexion administrateur"
- ✅ Liste des salles avec filtres
- ✅ Données temps réel (température, CO₂)

### 3. Tester la connexion admin

Cliquer sur "Connexion administrateur" ou aller sur http://localhost:3000/admin/login

**Identifiants par défaut :**
```
Email: admin@campus.fr
Mot de passe: admin123
```

**Ce qui devrait se passer :**
- ✅ Formulaire de connexion stylisé
- ✅ Après connexion → redirection vers /admin
- ✅ Menu utilisateur avec avatar en haut à droite
- ✅ Option "Déconnexion" dans le menu

### 4. Tester le dashboard admin

Une fois connecté, vous devriez voir :
- ✅ "Administration" dans la sidebar
- ✅ Liste des devices IoT
- ✅ Formulaires de création (bâtiment, salle, capteur)
- ✅ Configuration des seuils
- ✅ Logs d'activité

**Tester les fonctionnalités :**
- Créer un bâtiment
- Créer une salle
- Créer un device
- Assigner un device à une salle
- Modifier un device (nom, statut, etc.)
- Cliquer sur "Modifier" d'un device pour voir le dialog

### 5. Tester la déconnexion

- Cliquer sur l'avatar en haut à droite
- Cliquer sur "Déconnexion"
- Vérifier que vous êtes redirigé vers l'accueil
- Vérifier que "Administration" n'apparaît plus dans le menu

### 6. Tester la protection des routes

- Se déconnecter
- Essayer d'accéder à http://localhost:3000/admin
- Vous devriez être redirigé vers /admin/login

## 🔍 Vérification de l'intégration

### Structure des types
```typescript
// ✅ Import centralisé fonctionne
import { Room, Device, User, Building } from '@/types';
```

### API Layer
```typescript
// ✅ Utilisation de l'API
import api from '@/lib/api';

// Exemple d'utilisation
const rooms = await api.rooms.getAll();
const device = await api.devices.getById(deviceId);
await api.devices.shutdown(deviceId);
```

### Authentification
```typescript
// ✅ Hook useAuth fonctionne
import { useAuth } from '@/contexts/AuthContext';

function MonComposant() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Non connecté</div>;
  }
  
  return <div>Bonjour {user?.email}</div>;
}
```

### Protection de routes
```typescript
// ✅ ProtectedRoute fonctionne
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRoles={['SUPERVISOR']}>
      <AdminContent />
    </ProtectedRoute>
  );
}
```

## 📱 Tests responsive

### Mobile (< 768px)
- ✅ Menu burger fonctionnel
- ✅ Cartes des salles en colonne unique
- ✅ Filtres empilés
- ✅ Page de login adaptée

### Tablette (768px - 1024px)
- ✅ Grille 2 colonnes pour les salles
- ✅ Sidebar visible
- ✅ Formulaires admin en 2 colonnes

### Desktop (> 1024px)
- ✅ Grille 3 colonnes pour les salles
- ✅ Sidebar fixe
- ✅ Formulaires admin en 3 colonnes

## 🎨 Tests du thème

### Mode clair / sombre
- ✅ Toggle dans le header (icône soleil/lune)
- ✅ Transition fluide
- ✅ Persistance du choix
- ✅ Couleurs adaptées dans tous les composants

## ⚡ Performance

### Optimisations implémentées
- ✅ SWR pour le cache et revalidation automatique
- ✅ Refresh automatique des données (10-30s)
- ✅ Lazy loading des composants
- ✅ Types TypeScript pour éviter les erreurs runtime

## 🐛 Debugging

### Si problème d'authentification

```typescript
// Vérifier dans la console navigateur
localStorage.getItem('accessToken')
localStorage.getItem('refreshToken')

// Si pas de token, se reconnecter
```

### Si problème d'API

```typescript
// Vérifier la santé de l'API
fetch('/api/health')
  .then(r => r.json())
  .then(console.log)
```

### Si problème de données

```typescript
// Vérifier MongoDB
// Dans un terminal
npm run seed  // Re-seed la database
```

## 📊 Données de test

Le projet devrait avoir des données de test. Si ce n'est pas le cas :

```bash
npm run seed
```

Cela créera :
- Bâtiments exemple
- Salles exemple
- Devices exemple
- Utilisateur admin (admin@campus.fr / admin123)
- Données de télémétrie

## ✨ Fonctionnalités clés à tester

### Espace Public
1. ✅ Filtrer les salles par bâtiment
2. ✅ Filtrer par disponibilité (disponible/occupée)
3. ✅ Filtrer par température (min/max)
4. ✅ Cliquer sur une salle pour voir les détails
5. ✅ Voir les graphiques de tendances
6. ✅ Indicateur de confort (emoji)

### Espace Admin
1. ✅ Créer un nouveau bâtiment
2. ✅ Créer une nouvelle salle
3. ✅ Créer un nouveau device
4. ✅ Assigner un device à une salle
5. ✅ Renommer un device
6. ✅ Modifier le statut d'un device (ONLINE/OFFLINE)
7. ✅ Toggle "Alimenté" pour un device
8. ✅ Voir l'historique des logs
9. ✅ Voir les devices scannés (SCAN_BY_CARD)

## 🎓 Points d'attention

### Sécurité
- ✅ Routes admin protégées
- ✅ Vérification des rôles
- ✅ Token JWT avec expiration
- ⚠️ En production : changer JWT_SECRET
- ⚠️ En production : HTTPS obligatoire

### UX
- ✅ Feedbacks visuels (loading, erreurs)
- ✅ Messages de succès/erreur
- ✅ Navigation intuitive
- ✅ Responsive design

### Performance
- ✅ Cache SWR
- ✅ Debouncing des inputs
- ✅ Lazy loading
- ✅ Optimisation des re-renders

## 🚀 Prochaines étapes suggérées

1. **Tester toutes les fonctionnalités** listées ci-dessus
2. **Personnaliser les couleurs** dans `tailwind.config.js`
3. **Ajouter des données de test** via le seed
4. **Tester sur mobile réel** (pas seulement devtools)
5. **Documenter les cas d'usage** spécifiques

## 💡 Conseils

### Pour le développement
- Utiliser les React DevTools pour debug
- Utiliser l'onglet Network pour voir les appels API
- Utiliser l'onglet Application pour voir localStorage

### Pour la présentation
- Préparer des données de démo intéressantes
- Tester le parcours utilisateur complet
- Préparer des scénarios (ex: "Une salle devient occupée")

## 🎉 Félicitations !

Vous avez maintenant un frontend moderne, bien structuré et fonctionnel pour votre projet IoT !

---

**Bon développement ! 🚀**

