# 🎓 Digital Campus IoT - Workshop M2 TL

## 📋 Vue d'ensemble du projet

Projet de supervision IoT pour les salles de campus développé avec **Next.js 16**, **TypeScript**, **TailwindCSS** et **shadcn/ui**.

## 🎯 Objectifs

Créer une solution web moderne permettant de :
- Visualiser en temps réel la disponibilité des salles
- Surveiller la température et la qualité de l'air (CO₂)
- Gérer les capteurs IoT (administration)
- Offrir une interface accessible et responsive

## 🏗️ Architecture

### Structure du projet

```
/
├── app/                      # Next.js App Router
│   ├── page.tsx             # Page publique (landing + liste salles)
│   ├── admin/               # Espace administration
│   │   ├── login/           # Page de connexion admin
│   │   └── page.tsx         # Dashboard admin (protégé)
│   ├── dashboard/           # Dashboard général
│   └── api/                 # API Routes (backend)
│
├── components/              # Composants réutilisables
│   ├── ui/                  # Composants shadcn/ui
│   ├── AppLayout.tsx        # Layout principal avec navigation
│   ├── RoomCard.tsx         # Carte d'affichage d'une salle
│   └── ProtectedRoute.tsx   # HOC pour protéger les routes
│
├── contexts/                # Contexts React
│   └── AuthContext.tsx      # Gestion de l'authentification
│
├── hooks/                   # Custom hooks
│   └── useRoomData.ts       # Hook pour récupérer les données salles
│
├── lib/                     # Utilitaires et services
│   ├── api.ts               # Couche d'abstraction API
│   ├── auth.ts              # Gestion auth backend (JWT)
│   └── utils.ts             # Fonctions utilitaires
│
├── types/                   # Types TypeScript
│   ├── auth.ts              # Types authentification
│   ├── building.ts          # Types bâtiments
│   ├── device.ts            # Types devices IoT
│   ├── room.ts              # Types salles
│   ├── telemetry.ts         # Types données capteurs
│   └── index.ts             # Export centralisé
│
└── models/                  # Modèles Mongoose (backend)
```

## 🚀 Fonctionnalités

### Espace Public

#### Page d'accueil
- **Hero section** moderne avec présentation du projet
- **Liste des salles** avec filtres :
  - Par bâtiment
  - Par étage
  - Par disponibilité (disponible/occupée)
  - Par température (min/max)
- **Affichage en temps réel** :
  - Statut de disponibilité (basé sur luminosité)
  - Température
  - Qualité de l'air (CO₂)
  - Graphiques de tendances
- **Bouton "Connexion administrateur"** bien visible

#### Règle de disponibilité
- **Disponible** : Luminosité < 1000 lux (lumières éteintes)
- **Occupée** : Luminosité ≥ 1000 lux (lumières allumées)

### Espace Admin (Protégé)

#### Authentification
- Page de login dédiée (`/admin/login`)
- Protection par rôle (SUPERVISOR uniquement)
- Gestion des tokens JWT (access + refresh)
- Menu utilisateur avec déconnexion

#### Dashboard Admin
- **Gestion des devices IoT** :
  - Liste complète des capteurs
  - Assigner un device à une salle
  - Renommer un device
  - Modifier les paramètres
  - Éteindre/allumer à distance
  - Voir toutes les données (temp, humidité, CO₂, luminosité, bruit)

- **Gestion des salles** :
  - Créer/modifier/supprimer des salles
  - Assigner des capteurs aux salles
  - Voir les statistiques par salle

- **Gestion des bâtiments** :
  - Créer/modifier des bâtiments
  - Vue hiérarchique bâtiment → salles → devices

- **Configuration globale** :
  - Seuils de température
  - Seuils de CO₂
  - Intervalle de mesure des capteurs
  - Niveau sonore max

- **Historique et logs** :
  - Logs d'audit des actions
  - Graphiques d'activité
  - Export des données

## 🔐 Authentification

### Système d'auth

```typescript
// Connexion
const { login, logout, user, isAuthenticated } = useAuth();

await login({ 
  email: 'admin@campus.fr', 
  password: 'admin123' 
});

// Protection de route
<ProtectedRoute requiredRoles={['SUPERVISOR']}>
  <AdminDashboard />
</ProtectedRoute>
```

### Compte par défaut
- **Email** : `admin@campus.fr`
- **Mot de passe** : `admin123`
- **Rôle** : SUPERVISOR

## 📡 API Layer

### Utilisation de la couche API

```typescript
import api from '@/lib/api';

// Récupérer les salles
const rooms = await api.rooms.getAll();

// Récupérer un device
const device = await api.devices.getById(deviceId);

// Mettre à jour un device
await api.devices.update(deviceId, {
  name: 'Nouveau nom',
  isPoweredOn: false
});

// Envoyer une commande
await api.devices.shutdown(deviceId);
```

### Endpoints disponibles

#### Auth
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `POST /api/auth/refresh` - Rafraîchir le token

#### Buildings
- `GET /api/buildings` - Liste des bâtiments
- `POST /api/buildings` - Créer un bâtiment
- `PATCH /api/buildings/by-id/:id` - Modifier un bâtiment

#### Rooms
- `GET /api/rooms` - Liste des salles
- `POST /api/rooms` - Créer une salle
- `GET /api/rooms/by-id/:id/data` - Données d'une salle
- `GET /api/rooms/status` - Statut de toutes les salles

#### Devices
- `GET /api/devices` - Liste des devices
- `POST /api/devices` - Créer un device
- `PATCH /api/devices/by-id/:id` - Modifier un device
- `POST /api/devices/by-id/:id/commands/led` - Contrôler la LED
- `POST /api/devices/by-id/:id/commands/reboot` - Redémarrer
- `POST /api/devices/by-id/:id/commands/shutdown` - Éteindre

## 🎨 Design System

### Composants UI (shadcn/ui)
- Buttons, Inputs, Labels
- Cards, Dialogs, Dropdowns
- Tables, Badges, Avatars
- Charts (recharts)
- Dark/Light mode

### Thème
- Variables CSS personnalisées
- Mode clair/sombre automatique
- Couleurs sémantiques pour les statuts

## 📱 Responsive Design

- **Mobile** : Menu burger, cartes empilées
- **Tablette** : Grille 2 colonnes
- **Desktop** : Grille 3 colonnes, sidebar fixe

## 🛠️ Technologies

- **Next.js 16** - Framework React avec App Router
- **TypeScript** - Typage statique
- **TailwindCSS 4** - Styling utilitaire
- **shadcn/ui** - Composants UI modernes
- **SWR** - Data fetching et cache
- **Recharts** - Graphiques
- **MongoDB + Mongoose** - Base de données
- **JWT (jose)** - Authentification

## 🚀 Démarrage

### Installation

```bash
npm install
# ou
pnpm install
```

### Variables d'environnement

Créer un fichier `.env.local` :

```env
MONGODB_URI=mongodb://localhost:27017/campus-iot
JWT_SECRET=votre-secret-jwt-tres-securise
```

### Lancement

```bash
# Développement
npm run dev

# Build production
npm run build
npm start

# Seed database (optionnel)
npm run seed
```

### Accès

- **Page publique** : http://localhost:3000
- **Login admin** : http://localhost:3000/admin/login
- **Dashboard admin** : http://localhost:3000/admin (après connexion)

## 📚 Hooks personnalisés

### useAuth
```typescript
const { user, isAuthenticated, login, logout, isLoading } = useAuth();
```

### useRoomData
```typescript
const { data: latest } = useRoomLatest(roomId);
const { data: series } = useRoomSeries(roomId);
const availability = mapLuminosityToAvailability(latest?.luminosity);
```

## 🔄 Gestion d'état

- **SWR** pour le fetching et cache des données
- **Context API** pour l'authentification
- **Local Storage** pour les tokens JWT
- **Refresh automatique** des données toutes les 10-30s

## 🎯 Bonnes pratiques

### Types
- Tous les types sont centralisés dans `/types`
- Import depuis `@/types` uniquement
- Types partagés entre frontend et backend

### API Calls
- Toujours utiliser `lib/api.ts`
- Gestion centralisée des erreurs
- Headers d'authentification automatiques

### Composants
- Composants réutilisables dans `/components`
- Props typées avec TypeScript
- Documentation inline

### Protection des routes
- Utiliser `<ProtectedRoute>` pour les pages admin
- Vérifier les rôles côté serveur également

## 📝 TODO / Améliorations futures

- [ ] Ajouter tests unitaires (Vitest)
- [ ] Implémenter WebSockets pour le temps réel
- [ ] Ajouter notifications push
- [ ] Export PDF des rapports
- [ ] Mode maintenance des devices
- [ ] Historique détaillé par salle
- [ ] Dashboard de statistiques avancées
- [ ] Mode hors-ligne (PWA)

## 🤝 Contribution

Ce projet est développé dans le cadre du **Workshop M2 TL**.

## 📄 Licence

Projet académique - Tous droits réservés

---

**Développé avec ❤️ pour le Digital Campus IoT Workshop**

