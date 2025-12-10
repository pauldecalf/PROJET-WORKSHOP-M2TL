# Architecture du Projet

## 📐 Vue d'ensemble

Ce projet est une application **Next.js 16** (App Router) avec **MongoDB** pour gérer un système IoT de salles connectées.

## 🏗️ Architecture technique

```
┌─────────────────────────────────────────────────────────┐
│                    Client (Browser)                      │
│              Next.js React Components                    │
└───────────────────┬─────────────────────────────────────┘
                    │ HTTP/REST
┌───────────────────▼─────────────────────────────────────┐
│              Next.js API Routes (App Router)            │
│    /api/devices    /api/rooms    /api/sensors          │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│                  Mongoose (ODM)                          │
│          Models & Schema Validation                      │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│                    MongoDB                               │
│            13 Collections (NoSQL)                        │
└─────────────────────────────────────────────────────────┘
```

## 📂 Structure des dossiers

```
PROJET-WORKSHOP/
│
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes (Backend)
│   │   ├── devices/
│   │   │   ├── route.ts          # GET, POST /api/devices
│   │   │   └── [id]/route.ts    # GET, PATCH, DELETE /api/devices/[id]
│   │   ├── rooms/
│   │   │   └── status/route.ts  # GET /api/rooms/status
│   │   └── sensors/
│   │       └── [sensorId]/
│   │           └── measurements/route.ts
│   │
│   ├── page.tsx                  # Page d'accueil
│   ├── layout.tsx                # Layout global
│   └── globals.css               # Styles globaux
│
├── lib/                          # Utilitaires
│   └── mongodb.ts                # Configuration connexion MongoDB
│
├── models/                       # Modèles Mongoose (13 fichiers)
│   ├── Building.ts               # Bâtiments
│   ├── Room.ts                   # Salles
│   ├── User.ts                   # Utilisateurs (SUPERVISOR/STUDENT)
│   ├── Device.ts                 # Devices IoT (ESP32, etc.)
│   ├── DeviceConfig.ts           # Historique de configuration
│   ├── Sensor.ts                 # Capteurs (temp, humidité, CO2...)
│   ├── SensorMeasurement.ts      # Mesures time-series
│   ├── RoomStatus.ts             # Statut des salles en temps réel
│   ├── NFCBadge.ts               # Badges NFC anonymisés
│   ├── NFCEvent.ts               # Événements NFC
│   ├── DeviceCommand.ts          # Commandes envoyées aux devices
│   ├── OTAUpdate.ts              # Mises à jour OTA
│   ├── AuditLog.ts               # Journal d'audit
│   └── index.ts                  # Export centralisé
│
├── types/                        # Types TypeScript
│   ├── enums.ts                  # Énumérations (roles, status, etc.)
│   └── global.d.ts               # Types globaux
│
├── scripts/                      # Scripts utilitaires
│   └── seed-database.ts          # Initialisation de la BDD
│
├── public/                       # Assets statiques
│
├── .env.local                    # Variables d'environnement (local)
├── .gitignore                    # Fichiers ignorés par Git
├── package.json                  # Dépendances et scripts
├── tsconfig.json                 # Configuration TypeScript
├── next.config.ts                # Configuration Next.js
├── tailwind.config.ts            # Configuration Tailwind CSS
│
└── Documentation/
    ├── README.md                 # Documentation principale
    ├── QUICKSTART.md             # Guide de démarrage rapide
    ├── MONGODB_SETUP.md          # Configuration MongoDB détaillée
    ├── API_ROUTES.md             # Documentation des API
    └── ARCHITECTURE.md           # Ce fichier
```

## 🗄️ Modèle de données MongoDB

### Relations entre collections

```
┌─────────────┐
│  buildings  │
└──────┬──────┘
       │ 1:N
       ▼
┌─────────────┐       ┌──────────────┐
│    rooms    │◄──1:1─┤ roomstatuses │
└──────┬──────┘       └──────────────┘
       │ 1:N
       ▼
┌─────────────┐       ┌───────────────┐
│   devices   │◄──1:N─┤ deviceconfigs │
└──────┬──────┘       └───────────────┘
       │ 1:N          ┌─────────────────┐
       ├──────────────┤ devicecommands  │
       │              └─────────────────┘
       │              ┌─────────────────┐
       ├──────────────┤   otaupdates    │
       │              └─────────────────┘
       ▼
┌─────────────┐
│   sensors   │
└──────┬──────┘
       │ 1:N
       ├──────────────┐
       ▼              ▼
┌──────────────────┐ ┌────────────┐
│sensormeasurements│ │ nfcevents  │
└──────────────────┘ └─────┬──────┘
                           │ N:1
                           ▼
                     ┌─────────────┐
                     │  nfcbadges  │
                     └─────────────┘

┌──────────────┐
│    users     │ (utilisé pour créer configs, commandes, audits)
└──────────────┘

┌──────────────┐
│  auditlogs   │ (journal global de toutes les actions)
└──────────────┘
```

### Description des collections

| Collection | Documents | Description |
|------------|-----------|-------------|
| `buildings` | Bâtiments | Immeubles physiques |
| `rooms` | Salles | Salles de classe dans les bâtiments |
| `roomstatuses` | Statuts | État temps réel des salles (disponible/occupée) |
| `users` | Utilisateurs | SUPERVISOR ou STUDENT |
| `devices` | Devices IoT | Boîtiers ESP32 avec capteurs |
| `deviceconfigs` | Configurations | Historique des configs de chaque device |
| `devicecommands` | Commandes | Commandes envoyées aux devices (LED, reboot, etc.) |
| `otaupdates` | Mises à jour | Mises à jour firmware OTA |
| `sensors` | Capteurs | Capteurs physiques sur les devices |
| `sensormeasurements` | Mesures | Données time-series des capteurs |
| `nfcbadges` | Badges NFC | Hash anonymisés des badges NFC |
| `nfcevents` | Événements NFC | Scans de badges (entrées/sorties) |
| `auditlogs` | Logs | Journal d'audit de toutes les actions |

## 🔄 Flux de données

### 1. Device IoT → API → MongoDB

```
[ESP32/Device]
    │ HTTP POST
    ▼
[POST /api/sensors/{id}/measurements]
    │ Validation
    ▼
[Mongoose Model]
    │ Insert
    ▼
[MongoDB Collection: sensormeasurements]
```

### 2. Dashboard Étudiant → Statut des salles

```
[Browser/App]
    │ HTTP GET
    ▼
[GET /api/rooms/status]
    │ Aggregation
    ▼
[MongoDB: roomstatuses + rooms + buildings]
    │ Population
    ▼
[JSON Response]
```

### 3. Superviseur → Commande Device

```
[Dashboard Superviseur]
    │ HTTP POST
    ▼
[POST /api/devices/{id}/commands]
    │ Create Command
    ▼
[MongoDB: devicecommands]
    │ status: PENDING
    ▼
[Device polling/webhook]
    │ Execute & Update
    ▼
[PATCH command status → ACKNOWLEDGED]
```

## 🛡️ Sécurité (à implémenter)

### Points à sécuriser

1. **Authentification**
   - Implémenter NextAuth.js ou JWT
   - Sessions sécurisées
   - Refresh tokens

2. **Autorisation**
   - Middleware de vérification des rôles
   - SUPERVISOR : accès complet
   - STUDENT : lecture seule du statut des salles

3. **Validation**
   - Validation des entrées (Zod, Joi)
   - Sanitization des données
   - Rate limiting

4. **Données sensibles**
   - Hash des mots de passe (bcrypt)
   - Anonymisation NFC (déjà implémenté)
   - HTTPS en production

### Exemple de middleware d'authentification

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.headers.get('authorization');
  
  // Vérifier le token JWT
  if (!token || !verifyToken(token)) {
    return NextResponse.json(
      { error: 'Non authentifié' },
      { status: 401 }
    );
  }
  
  // Vérifier les permissions selon le rôle
  const userRole = extractRole(token);
  const path = request.nextUrl.pathname;
  
  if (path.startsWith('/api/devices') && userRole !== 'SUPERVISOR') {
    return NextResponse.json(
      { error: 'Permission refusée' },
      { status: 403 }
    );
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

## 📊 Performance

### Index MongoDB

Les index suivants sont créés automatiquement par Mongoose :

**Devices :**
- `serialNumber` (unique)
- `roomId`
- `status`

**Sensors :**
- `deviceId`
- `type`

**SensorMeasurements :**
- `sensorId + measuredAt` (composé, desc)

**Users :**
- `email` (unique)

**Rooms :**
- `buildingId`

### Optimisations recommandées

1. **Pagination** : Ajouter pagination pour les listes longues
2. **Cache** : Utiliser Redis pour les statuts de salles
3. **Compression** : Activer gzip pour les réponses API
4. **CDN** : Utiliser Vercel Edge pour les assets statiques

## 🔧 Technologies utilisées

| Catégorie | Technologie | Version |
|-----------|-------------|---------|
| Framework | Next.js | 16.0.8 |
| Runtime | React | 19.2.1 |
| Base de données | MongoDB | 5.0+ |
| ODM | Mongoose | 9.0.1 |
| Langage | TypeScript | 5.x |
| Styles | Tailwind CSS | 4.x |
| Node.js | Node.js | 18+ |

## 🚀 Déploiement

### Développement
```bash
npm run dev
```

### Production

1. **Build**
   ```bash
   npm run build
   ```

2. **Démarrer**
   ```bash
   npm start
   ```

### Déploiement sur Vercel

1. Connectez votre repo GitHub à Vercel
2. Ajoutez `MONGODB_URI` dans les variables d'environnement Vercel
3. Déployez automatiquement à chaque push

### Variables d'environnement en production

```env
MONGODB_URI=mongodb+srv://...
NEXTAUTH_URL=https://votre-domaine.com
NEXTAUTH_SECRET=votre-secret-aleatoire
```

## 📈 Évolutions futures

### Fonctionnalités à ajouter

- [ ] Authentification NextAuth.js
- [ ] Dashboard temps réel avec WebSocket
- [ ] Graphiques de mesures (Chart.js, Recharts)
- [ ] Alertes en temps réel (température élevée, CO2...)
- [ ] Export de données (CSV, Excel)
- [ ] Planning des réservations de salles
- [ ] Application mobile (React Native)
- [ ] Notifications push
- [ ] Analyse prédictive (ML)
- [ ] Support multi-langue i18n

### Améliorations techniques

- [ ] Tests unitaires (Jest, Vitest)
- [ ] Tests E2E (Playwright)
- [ ] CI/CD (GitHub Actions)
- [ ] Documentation API (Swagger/OpenAPI)
- [ ] Monitoring (Sentry, LogRocket)
- [ ] Cache Redis
- [ ] Queue de messages (Bull, RabbitMQ)

## 📝 Conventions de code

### Nommage

- **Fichiers** : PascalCase pour les composants React, camelCase pour utils
- **Collections MongoDB** : minuscules, pluriel (ex: `devices`, `sensors`)
- **Variables** : camelCase
- **Types/Interfaces** : PascalCase avec préfixe `I` pour interfaces

### Structure de fichier

```typescript
// 1. Imports externes
import mongoose from 'mongoose';

// 2. Imports internes
import { SensorType } from '@/types/enums';

// 3. Interfaces/Types
export interface ISensor extends Document {
  // ...
}

// 4. Schema
const SensorSchema = new Schema({ ... });

// 5. Index
SensorSchema.index({ ... });

// 6. Export
export const Sensor = mongoose.model(...);
```

## 🤝 Contribution

Pour contribuer au projet :

1. Fork le projet
2. Créez une branche (`git checkout -b feature/ma-fonctionnalite`)
3. Committez vos changements (`git commit -m 'Ajout de ...'`)
4. Push vers la branche (`git push origin feature/ma-fonctionnalite`)
5. Ouvrez une Pull Request

---

**Dernière mise à jour :** Décembre 2025

