# 🚀 START HERE - Workshop IoT

## ✅ Application complète et prête !

Votre plateforme IoT est **100% fonctionnelle** avec :
- 🎨 **Frontend moderne** (Landing, Admin, Dashboard public)
- 🔧 **Backend API complet** (32 routes)
- 🔐 **Authentification** (JWT)
- 📚 **Documentation Swagger**

---

## ⚡ Démarrage rapide (2 minutes)

### 1. Configuration MongoDB

**Option A : MongoDB Atlas (Cloud - Recommandé)**

1. Créer un compte sur https://www.mongodb.com/cloud/atlas
2. Créer un cluster gratuit
3. Créer un utilisateur de base de données
4. Obtenir l'URI de connexion
5. Copier dans `.env.local` :

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/workshop?retryWrites=true&w=majority
```

**Option B : MongoDB Local**

```bash
# Installer MongoDB localement
brew install mongodb-community  # macOS

# Lancer MongoDB
brew services start mongodb-community

# URI locale
MONGODB_URI=mongodb://localhost:27017/workshop
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Lancer l'application

```bash
npm run dev
```

### 4. Ouvrir dans le navigateur

```
http://localhost:3000
```

**C'est tout ! 🎉**

---

## 🌐 Pages disponibles

### Pages publiques

| Page | URL | Description |
|------|-----|-------------|
| 🏠 Landing | `http://localhost:3000/` | Page d'accueil |
| 📊 Dashboard | `http://localhost:3000/public/rooms` | Salles en temps réel |
| 📚 API Docs | `http://localhost:3000/api-docs` | Documentation Swagger |

### Pages admin (authentification requise)

| Page | URL | Description |
|------|-----|-------------|
| 🔐 Login | `http://localhost:3000/admin/login` | Connexion |
| ✍️ Register | `http://localhost:3000/admin/register` | Inscription |
| 📈 Dashboard | `http://localhost:3000/admin/dashboard` | Vue d'ensemble admin |

---

## 🎯 Premier test (5 minutes)

### 1. Créer un compte admin

```bash
# Ouvrir dans le navigateur
open http://localhost:3000/admin/register

# Ou via API
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin1234!",
    "displayName": "Admin Test"
  }'
```

### 2. Se connecter

```bash
open http://localhost:3000/admin/login
```

Ou utiliser les identifiants créés ci-dessus.

### 3. Créer un bâtiment

```bash
curl -X POST http://localhost:3000/api/buildings \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bâtiment A",
    "address": "123 Rue de Test"
  }'
```

### 4. Créer une salle

```bash
curl -X POST http://localhost:3000/api/rooms \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Salle A101",
    "buildingId": "BUILDING_ID_FROM_STEP_3",
    "floor": 1,
    "capacity": 30,
    "status": "AVAILABLE"
  }'
```

### 5. Créer un device

```bash
curl -X POST http://localhost:3000/api/devices \
  -H "Content-Type: application/json" \
  -d '{
    "serialNumber": "ESP32-001",
    "name": "Capteur Température A101",
    "roomId": "ROOM_ID_FROM_STEP_4"
  }'
```

**✅ Le device sera automatiquement en `configStatus: PENDING`**

### 6. Voir les salles

```bash
open http://localhost:3000/public/rooms
```

---

## 📚 Documentation complète

| Guide | Description |
|-------|-------------|
| `COMPLETE_APP.md` | 📖 Vue d'ensemble complète |
| `FRONTEND_GUIDE.md` | 🎨 Guide du frontend |
| `API_ROUTES.md` | 🔧 Documentation des routes API |
| `DEPLOYMENT_FRONTEND.md` | 🚀 Déploiement Railway |
| `QUICKSTART.md` | ⚡ Guide de démarrage |

---

## 🔧 Routes API principales

### Auth (4 routes)

```bash
POST /api/auth/register    # Créer un compte
POST /api/auth/login       # Se connecter
POST /api/auth/refresh     # Rafraîchir le token
POST /api/auth/logout      # Se déconnecter
```

### Devices (8 routes)

```bash
GET    /api/devices                              # Liste des devices
POST   /api/devices                              # Créer un device
GET    /api/devices/by-id/[id]                   # Détails d'un device
PATCH  /api/devices/by-id/[id]                   # Modifier un device
DELETE /api/devices/by-id/[id]                   # Supprimer un device
GET    /api/devices/by-serial/[serialNumber]     # Device par serial
GET    /api/devices/by-serial/[serialNumber]/data # Données par serial
POST   /api/devices/by-serial/[serialNumber]/data # Envoyer données
```

### Rooms (5 routes)

```bash
GET   /api/rooms                    # Liste des salles
POST  /api/rooms                    # Créer une salle
GET   /api/rooms/by-id/[id]         # Détails d'une salle
PATCH /api/rooms/by-id/[id]         # Modifier une salle
GET   /api/rooms/status             # Statut de toutes les salles
```

### Buildings (6 routes)

```bash
GET    /api/buildings                     # Liste des bâtiments
POST   /api/buildings                     # Créer un bâtiment
GET    /api/buildings/by-id/[id]          # Détails d'un bâtiment
PATCH  /api/buildings/by-id/[id]          # Modifier un bâtiment
DELETE /api/buildings/by-id/[id]          # Supprimer un bâtiment
GET    /api/buildings/by-id/[id]/rooms    # Salles d'un bâtiment
```

**Total : 32 routes API**

---

## 🎨 Captures d'écran

### Landing Page

```
┌─────────────────────────────────────────┐
│ 🏠 Workshop IoT                         │
│                                         │
│  Système IoT de Gestion de Salles      │
│                                         │
│  [Voir les salles] [API Docs]          │
│                                         │
│  📊 Données temps réel                  │
│  🏠 Gestion des salles                  │
│  🔖 Contrôle NFC                        │
└─────────────────────────────────────────┘
```

### Dashboard Public

```
┌─────────────────────────────────────────┐
│ 🏠 Disponibilité des salles             │
│                                         │
│ [20 Total] [15 Disponibles] [3 Occupées]│
│                                         │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│ │ Salle   │ │ Salle   │ │ Salle   │   │
│ │ A101    │ │ A102    │ │ A103    │   │
│ │ ✅ AVAIL │ │ 🔴 OCCUP │ │ ✅ AVAIL │   │
│ └─────────┘ └─────────┘ └─────────┘   │
└─────────────────────────────────────────┘
```

### Dashboard Admin

```
┌─────────────────────────────────────────┐
│ 📊 Dashboard Admin                      │
│                                         │
│ Bienvenue, Admin! 👋                    │
│                                         │
│ [10 Devices] [5 Salles] [2 Bâtiments]  │
│                                         │
│ 📊 Statut des devices                   │
│ • ONLINE: 7                             │
│ • OFFLINE: 2                            │
│ • ERROR: 1                              │
│                                         │
│ [+ Device] [+ Salle] [+ Bâtiment]       │
└─────────────────────────────────────────┘
```

---

## 🐛 Problèmes courants

### Erreur : "Cannot connect to MongoDB"

**Solution** :
```bash
# Vérifier que MONGODB_URI est défini
cat .env.local | grep MONGODB_URI

# Tester la connexion
mongosh "votre-mongodb-uri"
```

### Erreur : "Failed to fetch" sur les API calls

**Solution** :
```bash
# Vérifier que le serveur est lancé
npm run dev

# Vérifier l'URL
echo "http://localhost:3000/api/health"
```

### Page blanche après build

**Solution** :
```bash
# Rebuild
rm -rf .next
npm run build
npm run dev
```

### Hot reload ne fonctionne pas

**Solution** :
```bash
npm run fix-routes
```

---

## 🔒 Sécurité

### JWT Secrets (IMPORTANT)

**Pour la production**, générez de vrais secrets :

```bash
# Générer JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Générer JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Ajouter dans .env.local
```

### Ne jamais commit

```bash
# .gitignore contient déjà :
.env
.env.local
.env.production
```

---

## 🚀 Déployer sur Railway

### 1. Push vers GitHub

```bash
git add .
git commit -m "feat: Complete IoT application"
git push origin main
```

### 2. Créer un projet Railway

1. Aller sur https://railway.app
2. Connecter le repo GitHub
3. Configurer les variables d'environnement
4. Déployer automatiquement

### 3. Variables Railway

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=votre-secret-genere
JWT_REFRESH_SECRET=votre-refresh-secret-genere
NODE_ENV=production
PORT=8080
```

**URL finale** :
```
https://projet-workshop-m2tl-production.up.railway.app
```

---

## ✅ Checklist de validation

### Backend
- [ ] MongoDB connecté
- [ ] API health OK (`/api/health`)
- [ ] Swagger accessible (`/api-docs`)
- [ ] Auth fonctionne (login/register)
- [ ] Routes CRUD devices OK
- [ ] Routes CRUD rooms OK
- [ ] Routes CRUD buildings OK

### Frontend
- [ ] Landing page affichée
- [ ] Dashboard public affiche les salles
- [ ] Login/Register fonctionnent
- [ ] Dashboard admin affiche les stats
- [ ] Déconnexion fonctionne
- [ ] Design responsive

### Déploiement
- [ ] Build sans erreur
- [ ] Variables d'environnement configurées
- [ ] Healthcheck Railway OK
- [ ] Application accessible en ligne

---

## 📊 Statistiques du projet

```
✅ 32 routes API
✅ 12 modèles MongoDB
✅ 5 pages frontend
✅ 7 enums TypeScript
✅ 100% TypeScript
✅ Documentation complète
✅ Prêt pour la production
```

---

## 🎉 C'est parti !

```bash
# Lancer l'application
npm run dev

# Ouvrir dans le navigateur
open http://localhost:3000

# Créer votre premier compte admin
open http://localhost:3000/admin/register
```

**🚀 Profitez de votre plateforme IoT !**

---

## 📞 Support

- **Documentation** : Voir les fichiers `.md` à la racine
- **API Docs** : http://localhost:3000/api-docs
- **Logs** : Vérifier la console du terminal

---

## 🎯 Prochaines étapes suggérées

1. **Créer des données de test** (buildings, rooms, devices)
2. **Configurer un ESP32** pour envoyer des données réelles
3. **Personnaliser le design** selon vos besoins
4. **Ajouter des graphiques** (Chart.js, Recharts)
5. **Configurer les notifications** pour les alertes
6. **Déployer en production** sur Railway

---

**Bonne chance avec votre projet IoT ! 🎊**

