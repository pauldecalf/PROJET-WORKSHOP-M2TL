# 🎓 Digital Campus IoT - Workshop M2 TL

**Application web de supervision IoT pour la gestion intelligente des salles de classe**

Une solution complète de monitoring en temps réel pour un campus connecté, permettant de suivre la disponibilité, la température, la qualité de l'air et l'occupation des salles grâce à des capteurs IoT et badges NFC.

---

## 📋 Table des matières

- [Vue d'ensemble](#-vue-densemble)
- [Fonctionnalités](#-fonctionnalités)
- [Architecture](#-architecture)
- [Technologies](#-technologies-utilisées)
- [Installation](#-installation)
- [Utilisation](#-utilisation)
- [API Documentation](#-api-documentation)
- [Base de données](#-base-de-données)
- [Structure du projet](#-structure-du-projet)
- [Développement](#-développement)
- [Déploiement](#-déploiement)

---

## 🎯 Vue d'ensemble

Le projet **Digital Campus IoT** est une plateforme web moderne de supervision IoT développée avec **Next.js 16**, **TypeScript** et **MongoDB**. Il permet de gérer et superviser en temps réel un réseau de capteurs IoT déployés dans les salles de classe d'un campus universitaire.

### Contexte

Dans le cadre d'un projet de transformation numérique d'un campus, des boîtiers IoT (ESP32) équipés de multiples capteurs sont installés dans chaque salle. Ces capteurs collectent :
- 🌡️ **Température** et **humidité**
- 💨 **Qualité de l'air** (CO2, TVOC, indice AQI)
- 💡 **Luminosité** et **niveau sonore**
- 👥 **Présence** et **occupation** (via capteur PIR et NFC)

L'application web permet aux étudiants de consulter l'état des salles en temps réel, et aux superviseurs (administrateurs) de gérer l'infrastructure IoT complète.

---

## ✨ Fonctionnalités

### 🌐 Espace Public (Étudiants)

#### Page d'accueil
- **Visualisation en temps réel** des 15 salles du campus
- Affichage du statut : **Disponible** 🟢 / **Occupée** 🔴 / **Inconnu** ⚪
- Indicateurs environnementaux :
  - 🌡️ Température actuelle
  - 💨 Qualité de l'air (CO2 et indice)
  - 💧 Humidité
  - 💡 Luminosité
  - 🔊 Niveau sonore
- Interface **responsive** (mobile, tablette, desktop)
- Design moderne avec **TailwindCSS** et **shadcn/ui**

### 🔐 Espace Administrateur (Superviseurs)

#### Authentification
- Connexion sécurisée avec **JWT** (access token + refresh token)
- Gestion des sessions avec **localStorage**
- Protection des routes admin avec **guards**
- Profil utilisateur dans le header

#### Dashboard de Supervision
- **KPI en temps réel** :
  - Nombre total de salles
  - Capteurs en ligne / hors ligne
  - Alertes actives
- **Tableau de gestion des capteurs** :
  - Liste complète avec statut, batterie, dernière connexion
  - Actions rapides : Modifier, Éteindre, Reboot, Supprimer
  - Assignation aux salles
- **Logs d'activité** en temps réel
- **Graphiques de monitoring** (température, activité)

#### Gestion des Entités

##### 🏢 Bâtiments
- ✅ Créer, modifier, supprimer des bâtiments
- Informations : nom, adresse, nombre d'étages
- Protection : impossible de supprimer si des salles sont associées

##### 🚪 Salles
- ✅ Créer, modifier, supprimer des salles
- Assignation à un bâtiment
- Informations : nom, étage, statut, capacité

##### 📡 Capteurs/Devices
- ✅ Créer, modifier, supprimer des capteurs
- Configuration : numéro de série, nom, statut
- Assignation à une salle
- Commandes à distance : REBOOT, SHUTDOWN, LED control

##### 👥 Utilisateurs
- ✅ Créer des comptes (Superviseur ou Étudiant)
- Gestion des rôles et permissions
- Validation email et mot de passe (min 8 caractères)

#### Actions Rapides en Popup
- Tous les formulaires de création/modification s'ouvrent en **Dialog**
- Interface épurée avec boutons d'action
- Validation en temps réel
- Rafraîchissement automatique des données (SWR)

#### Responsive Admin
- Version desktop complète
- Version mobile simplifiée
- Message "📱 Disponible sur desktop uniquement" pour les tableaux complexes

---

## 🏗️ Architecture

### Architecture Frontend

```
┌─────────────────────────────────────────────────┐
│                   Next.js App                   │
│                  (App Router)                   │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────┐        ┌──────────────┐     │
│  │   Public     │        │    Admin     │     │
│  │   Space      │        │    Space     │     │
│  │              │        │              │     │
│  │ • Room list  │        │ • Dashboard  │     │
│  │ • Real-time  │        │ • Management │     │
│  │   status     │        │ • Logs       │     │
│  └──────────────┘        └──────────────┘     │
│                                                 │
│  ┌─────────────────────────────────────────┐  │
│  │      Components (shadcn/ui)             │  │
│  │  • Cards • Dialogs • Tables • Forms     │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  ┌─────────────────────────────────────────┐  │
│  │      Hooks & Context                    │  │
│  │  • AuthContext • useRoomData (SWR)      │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
└─────────────────────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────┐
│              REST API Routes                    │
│          (Next.js API Routes)                   │
├─────────────────────────────────────────────────┤
│  /api/auth/*      - Authentication              │
│  /api/devices/*   - IoT Devices                 │
│  /api/rooms/*     - Rooms & Status              │
│  /api/buildings/* - Buildings                   │
│  /api/history     - Audit Logs                  │
└─────────────────────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────┐
│              MongoDB Database                   │
│          (Mongoose ODM - 13 Collections)        │
├─────────────────────────────────────────────────┤
│  • users           • buildings                  │
│  • rooms           • devices                    │
│  • roomstatuses    • devicedata                 │
│  • sensors         • sensormeasurements         │
│  • nfcbadges       • nfcevents                  │
│  • devicecommands  • otaupdates                 │
│  • auditlogs                                    │
└─────────────────────────────────────────────────┘
```

### Architecture Backend (ESP32 - Non inclus dans ce repo)

```
┌───────────────────────────────┐
│      ESP32 Device             │
│                               │
│  • BME280 (Temp/Humidity)     │
│  • CCS811 (CO2/TVOC)          │
│  • BH1750 (Light)             │
│  • Sound Sensor               │
│  • PIR Motion                 │
│  • RC522 NFC Reader           │
│                               │
│  → WiFi → API REST            │
└───────────────────────────────┘
```

---

## 🛠️ Technologies Utilisées

### Frontend
- **[Next.js 16](https://nextjs.org/)** - Framework React avec App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Typage statique
- **[TailwindCSS](https://tailwindcss.com/)** - Framework CSS utility-first
- **[shadcn/ui](https://ui.shadcn.com/)** - Composants UI réutilisables
- **[SWR](https://swr.vercel.app/)** - Fetching & caching de données
- **[Recharts](https://recharts.org/)** - Graphiques et visualisations
- **[Lucide React](https://lucide.dev/)** - Icônes modernes

### Backend
- **[Next.js API Routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes)** - API REST
- **[MongoDB](https://www.mongodb.com/)** - Base de données NoSQL
- **[Mongoose 9](https://mongoosejs.com/)** - ODM pour MongoDB
- **[bcryptjs](https://www.npmjs.com/package/bcryptjs)** - Hash de mots de passe
- **[jose](https://github.com/panva/jose)** - JWT (ES256)

### Outils de Développement
- **[ESLint](https://eslint.org/)** - Linter JavaScript/TypeScript
- **[Prettier](https://prettier.io/)** - Formatage de code
- **[Swagger UI](https://swagger.io/tools/swagger-ui/)** - Documentation API interactive

---

## 🚀 Installation

### Prérequis

- **Node.js** 18+ et **npm** (ou yarn/pnpm)
- **MongoDB** 6+ (local ou cloud - MongoDB Atlas)
- **Git**

### 1. Cloner le repository

```bash
git clone <repository-url>
cd PROJET-WORKSHOP
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration des variables d'environnement

Créer un fichier `.env.local` à la racine du projet :

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/workshop

# JWT (Générez des clés aléatoires sécurisées)
JWT_SECRET_KEY=your-super-secret-key-min-32-chars
JWT_REFRESH_SECRET_KEY=your-refresh-secret-key-min-32-chars

# Next.js
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**⚠️ Important :** Pour la production, utilisez des clés JWT fortes et uniques !

### 4. Démarrer MongoDB

#### Option A : MongoDB Local

```bash
# macOS (avec Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

#### Option B : MongoDB Atlas (Cloud)

1. Créez un compte sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créez un cluster gratuit
3. Obtenez l'URI de connexion
4. Mettez à jour `MONGODB_URI` dans `.env.local`

### 5. Initialiser la base de données avec des données de test

```bash
npm run seed
```

Cette commande crée :
- 3 utilisateurs (admin, supervisor, student)
- 1 bâtiment (Batiment principal)
- 2 salles (Salle 101, Salle 102)
- 1 device ESP32 avec capteurs
- Des données de test

**Comptes par défaut :**
- 🔐 **Admin** : `admin@campus.fr` / `admin123`
- 🔐 **Supervisor** : `supervisor@example.com` / `supervisor123`
- 🔐 **Student** : `student@example.com` / `student123`

### 6. Lancer le serveur de développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

---

## 📖 Utilisation

### Accès Public

1. Accédez à [http://localhost:3000](http://localhost:3000)
2. Visualisez la liste des salles avec leur statut en temps réel
3. Consultez les données environnementales (température, qualité de l'air, etc.)

### Accès Administrateur

1. Cliquez sur l'icône de connexion dans le header
2. Connectez-vous avec `admin@campus.fr` / `admin123`
3. Accédez au dashboard depuis le menu utilisateur
4. Gérez les entités :
   - **Bâtiments** : Créer, modifier, supprimer
   - **Salles** : Créer, assigner à un bâtiment
   - **Capteurs** : Créer, configurer, commander
   - **Utilisateurs** : Créer des comptes

### Création Rapide

Dans le dashboard admin, utilisez la section **"Création rapide"** :
- 🏠 **Nouveau bâtiment** - Créer un bâtiment
- ⚙️ **Nouvelle salle** - Créer une salle
- 📡 **Nouveau capteur** - Ajouter un device IoT
- 👤 **Nouveau compte** - Créer un utilisateur

### Modification d'Entités

Dans la section **"Modifier un bâtiment / une salle"** :
- Cliquez sur "Modifier" pour éditer
- Cliquez sur l'icône 🗑️ pour supprimer
- Les modifications sont instantanées avec SWR

---

## 📡 API Documentation

### Documentation Interactive

Accédez à la documentation Swagger UI :
- **URL** : [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- Testez les endpoints directement depuis l'interface
- Consultez les schémas de données complets

### Endpoints Principaux

#### 🔐 Authentication

```http
POST /api/auth/login
POST /api/auth/register
POST /api/auth/refresh
POST /api/auth/logout
```

#### 🏢 Buildings

```http
GET    /api/buildings              # Liste des bâtiments
POST   /api/buildings              # Créer un bâtiment
GET    /api/buildings/by-id/:id    # Détails d'un bâtiment
PATCH  /api/buildings/by-id/:id    # Modifier un bâtiment
DELETE /api/buildings/by-id/:id    # Supprimer un bâtiment
GET    /api/buildings/by-id/:id/stats  # Statistiques
```

#### 🚪 Rooms

```http
GET    /api/rooms                  # Liste des salles
POST   /api/rooms                  # Créer une salle
GET    /api/rooms/by-id/:id        # Détails d'une salle
PATCH  /api/rooms/by-id/:id        # Modifier une salle
DELETE /api/rooms/by-id/:id        # Supprimer une salle
GET    /api/rooms/status           # Statuts de toutes les salles
GET    /api/rooms/by-id/:id/status # Statut d'une salle
GET    /api/rooms/by-id/:id/data   # Données time-series
```

#### 📡 Devices

```http
GET    /api/devices                     # Liste des devices
POST   /api/devices                     # Créer un device
GET    /api/devices/by-id/:id           # Détails d'un device
PATCH  /api/devices/by-id/:id           # Modifier un device
DELETE /api/devices/by-id/:id           # Supprimer un device
GET    /api/devices/by-serial/:serial   # Device par serial number
POST   /api/devices/by-serial/:serial/data  # Envoyer des données
POST   /api/devices/by-id/:id/commands/reboot   # Reboot
POST   /api/devices/by-id/:id/commands/shutdown # Shutdown
POST   /api/devices/by-id/:id/commands/led      # LED control
```

#### 📊 History

```http
GET    /api/history                # Logs d'audit
```

### Exemples de Requêtes

#### Obtenir le statut de toutes les salles

```bash
curl -X GET http://localhost:3000/api/rooms/status
```

#### Créer un nouveau bâtiment (authentifié)

```bash
curl -X POST http://localhost:3000/api/buildings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Bâtiment B",
    "address": "10 Avenue des Sciences",
    "totalFloors": 3
  }'
```

#### Envoyer des données depuis un ESP32

```bash
curl -X POST http://localhost:3000/api/devices/by-serial/ESP32-001/data \
  -H "Content-Type: application/json" \
  -d '{
    "temperature": 22.5,
    "humidity": 45.2,
    "co2": 420,
    "tvoc": 50,
    "light": 350,
    "sound": 40,
    "motion": true
  }'
```

---

## 🗄️ Base de Données

### Collections MongoDB

#### 📊 Schéma Complet

```
workshop (database)
│
├── users                  # Utilisateurs (authentification)
├── buildings              # Bâtiments du campus
├── rooms                  # Salles de classe
├── roomstatuses           # Statut temps réel des salles
├── devices                # Boîtiers IoT (ESP32)
├── devicedata             # Données time-series des devices
├── sensors                # Capteurs individuels
├── sensormeasurements     # Mesures time-series des capteurs
├── nfcbadges              # Badges NFC
├── nfcevents              # Événements NFC (anonymisés)
├── devicecommands         # Commandes envoyées aux devices
├── otaupdates             # Mises à jour OTA
└── auditlogs              # Logs d'audit système
```

#### 🔍 Détails des Collections

**users**
```javascript
{
  _id: ObjectId,
  email: String,
  passwordHash: String,
  role: Enum["SUPERVISOR", "STUDENT"],
  displayName: String,
  createdAt: Date
}
```

**buildings**
```javascript
{
  _id: ObjectId,
  name: String,
  address: String,
  totalFloors: Number,
  createdAt: Date
}
```

**rooms**
```javascript
{
  _id: ObjectId,
  buildingId: ObjectId (ref: Building),
  name: String,
  floor: Number,
  currentStatus: Enum["AVAILABLE", "OCCUPIED", "UNKNOWN"],
  capacity: Number,
  createdAt: Date
}
```

**devices**
```javascript
{
  _id: ObjectId,
  serialNumber: String (unique),
  name: String,
  roomId: ObjectId (ref: Room),
  status: Enum["ONLINE", "OFFLINE", "ERROR", "UNKNOWN"],
  configStatus: Enum["PENDING", "SCAN_BY_CARD", "CONFIGURED"],
  firmwareVersion: String,
  batteryLevel: Number,
  isPoweredOn: Boolean,
  lastSeenAt: Date,
  createdAt: Date
}
```

**devicedata**
```javascript
{
  _id: ObjectId,
  deviceId: ObjectId (ref: Device),
  temperature: Number,
  humidity: Number,
  co2: Number,
  tvoc: Number,
  airQualityIndex: Number,
  light: Number,
  sound: Number,
  motion: Boolean,
  timestamp: Date
}
```

### Scripts MongoDB

#### Seed Database

```bash
npm run seed
```

Initialise la base avec des données de test complètes.

#### Create Admin User

```bash
npm run create-admin
```

Crée uniquement un utilisateur admin.

---

## 📁 Structure du Projet

```
PROJET-WORKSHOP/
│
├── app/                          # Application Next.js (App Router)
│   ├── admin/
│   │   ├── login/
│   │   │   └── page.tsx         # Page de connexion admin
│   │   └── page.tsx             # Dashboard admin
│   ├── api/                     # API Routes
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── refresh/
│   │   │   └── logout/
│   │   ├── buildings/
│   │   │   ├── route.ts
│   │   │   └── by-id/[id]/
│   │   ├── rooms/
│   │   │   ├── route.ts
│   │   │   ├── status/
│   │   │   └── by-id/[id]/
│   │   ├── devices/
│   │   │   ├── route.ts
│   │   │   ├── by-id/[id]/
│   │   │   └── by-serial/[serialNumber]/
│   │   └── history/
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Page d'accueil publique
│
├── components/                  # Composants React
│   ├── ui/                      # Composants shadcn/ui
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── Header.tsx               # Header global
│   ├── ProtectedRoute.tsx       # Guard pour routes admin
│   └── RoomCard.tsx             # Card d'affichage salle
│
├── contexts/
│   └── AuthContext.tsx          # Context d'authentification
│
├── hooks/
│   └── useRoomData.ts           # Hook SWR pour données salles
│
├── lib/
│   ├── mongodb.ts               # Connexion MongoDB
│   ├── auth.ts                  # Utilitaires auth (JWT, bcrypt)
│   └── audit.ts                 # Système d'audit logs
│
├── models/                      # Modèles Mongoose
│   ├── Building.ts
│   ├── Room.ts
│   ├── RoomStatus.ts
│   ├── Device.ts
│   ├── DeviceData.ts
│   ├── Sensor.ts
│   ├── SensorMeasurement.ts
│   ├── NFCBadge.ts
│   ├── NFCEvent.ts
│   ├── DeviceCommand.ts
│   ├── OTAUpdate.ts
│   ├── AuditLog.ts
│   ├── User.ts
│   └── index.ts                 # Export centralisé
│
├── types/                       # Types TypeScript
│   ├── enums.ts                 # Énumérations (SSOT)
│   ├── auth.ts
│   ├── building.ts
│   ├── room.ts
│   ├── device.ts
│   ├── telemetry.ts
│   └── index.ts
│
├── scripts/                     # Scripts utilitaires
│   ├── seed-database.ts         # Script de seed complet
│   └── create-admin-user.ts     # Création admin
│
├── public/                      # Assets statiques
│
├── .env.local                   # Variables d'environnement (non versionné)
├── .gitignore
├── next.config.ts               # Configuration Next.js
├── tailwind.config.ts           # Configuration Tailwind
├── tsconfig.json                # Configuration TypeScript
├── package.json
└── README.md                    # Ce fichier
```

---

## 🔧 Développement

### Commandes Disponibles

```bash
# Développement
npm run dev              # Démarre le serveur de dev (port 3000)

# Build
npm run build            # Compile l'application
npm start                # Lance la version de production

# Database
npm run seed             # Initialise la DB avec données de test
npm run create-admin     # Crée un compte admin

# Linting
npm run lint             # Vérifie le code avec ESLint
```

### Guidelines de Développement

#### 1. **TypeScript Strict**
- Tous les fichiers doivent être typés
- Utiliser les types depuis `/types`
- Pas de `any` sauf exception justifiée

#### 2. **Composants Réutilisables**
- Utiliser shadcn/ui comme base
- Créer des composants atomiques dans `/components`
- Props typées avec TypeScript

#### 3. **API Routes**
- Suivre le pattern REST
- Validation des inputs
- Gestion des erreurs cohérente
- Documentation Swagger pour chaque endpoint

#### 4. **État Global**
- Context API pour l'authentification
- SWR pour le fetching de données
- Pas de Redux (Next.js App Router + SWR suffit)

#### 5. **Styling**
- TailwindCSS uniquement
- Classes utilitaires
- Responsive-first (mobile → desktop)
- Design system de shadcn/ui

### Ajouter une Nouvelle Fonctionnalité

#### Exemple : Ajouter une entité "Professor"

**1. Créer le modèle Mongoose**

```typescript
// models/Professor.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProfessor extends Document {
  firstName: string;
  lastName: string;
  email: string;
  department?: string;
  createdAt: Date;
}

const ProfessorSchema = new Schema<IProfessor>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  department: String,
}, { timestamps: { createdAt: 'createdAt', updatedAt: false } });

export const Professor: Model<IProfessor> =
  mongoose.models.Professor || mongoose.model<IProfessor>('Professor', ProfessorSchema);
```

**2. Créer les types TypeScript**

```typescript
// types/professor.ts
export interface Professor {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  department?: string;
  createdAt: string;
}
```

**3. Créer l'API Route**

```typescript
// app/api/professors/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Professor } from '@/models';

export async function GET(request: NextRequest) {
  await connectDB();
  const professors = await Professor.find().lean();
  return NextResponse.json({ success: true, data: professors });
}

export async function POST(request: NextRequest) {
  await connectDB();
  const body = await request.json();
  const professor = await Professor.create(body);
  return NextResponse.json({ success: true, data: professor }, { status: 201 });
}
```

**4. Créer le composant UI (Dialog)**

```typescript
// Dans app/admin/page.tsx
const CreateProfessorDialog = () => {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await fetch("/api/professors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        mutate("/api/professors");
        setForm({ firstName: "", lastName: "", email: "" });
        setOpen(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* ... */}
    </Dialog>
  );
};
```

---

## 🚀 Déploiement

### Option 1 : Vercel (Recommandé)

**Avantages :** Déploiement automatique, scaling, edge functions

1. **Créer un compte** sur [Vercel](https://vercel.com)
2. **Importer le projet** depuis GitHub
3. **Configurer les variables d'environnement** :
   - `MONGODB_URI`
   - `JWT_SECRET_KEY`
   - `JWT_REFRESH_SECRET_KEY`
4. **Déployer** 🚀

```bash
# Alternative : Vercel CLI
npm i -g vercel
vercel
```

### Option 2 : Docker

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
# Build et run
docker build -t campus-iot .
docker run -p 3000:3000 --env-file .env.local campus-iot
```

### Option 3 : VPS (DigitalOcean, AWS EC2, etc.)

```bash
# Sur le serveur
git clone <repo-url>
cd PROJET-WORKSHOP
npm install
npm run build

# Avec PM2 (process manager)
npm install -g pm2
pm2 start npm --name "campus-iot" -- start
pm2 save
pm2 startup
```

### Configuration Production

**Variables d'environnement production :**

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/workshop
JWT_SECRET_KEY=<générer-clé-forte-32chars>
JWT_REFRESH_SECRET_KEY=<générer-clé-forte-32chars>
NEXT_PUBLIC_API_URL=https://votre-domaine.com
NODE_ENV=production
```

---

## 📝 License

Ce projet est développé dans le cadre d'un workshop pédagogique M2 TL.

---

## 👥 Équipe & Support

### Auteur
Développé par Paul Decalf dans le cadre du Workshop M2 TL

### Support
Pour toute question ou problème :
- 📧 Email : support@campus-iot.fr
- 📖 Documentation : [API_ROUTES.md](./API_ROUTES.md)
- 🐛 Issues : GitHub Issues

---

## 🔗 Liens Utiles

- **[Next.js Documentation](https://nextjs.org/docs)**
- **[MongoDB Docs](https://docs.mongodb.com/)**
- **[Mongoose Guide](https://mongoosejs.com/docs/guide.html)**
- **[shadcn/ui Components](https://ui.shadcn.com/)**
- **[TailwindCSS](https://tailwindcss.com/docs)**
- **[SWR Documentation](https://swr.vercel.app/)**

---

## ⭐ Acknowledgments

Merci aux projets open-source suivants :
- Next.js par Vercel
- shadcn/ui par shadcn
- Mongoose par Automattic
- TailwindCSS par Tailwind Labs

---

**🎓 Digital Campus IoT - Transformons l'éducation avec l'IoT**
