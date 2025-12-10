# 🗺️ Roadmap API - Routes à implémenter

## 📊 État actuel : 7/28 routes créées

### ✅ Routes déjà implémentées (7)

| Méthode | Route | Status | Swagger |
|---------|-------|--------|---------|
| GET | `/api/devices` | ✅ | ✅ |
| POST | `/api/devices` | ✅ | ✅ |
| GET | `/api/devices/[id]` | ✅ | ✅ |
| PATCH | `/api/devices/[id]` | ✅ | ✅ |
| DELETE | `/api/devices/[id]` | ✅ | ✅ |
| GET | `/api/rooms/status` | ✅ | ✅ |
| GET | `/api/sensors/[sensorId]/measurements` | ✅ | ✅ |

---

## 🔐 Phase 1 : Authentification (Priorité HAUTE)

### Routes à créer

```
POST   /api/auth/login        # Connexion utilisateur
POST   /api/auth/refresh      # Rafraîchir le token
POST   /api/auth/logout       # Déconnexion
```

### Fichiers à créer

- `app/api/auth/login/route.ts`
- `app/api/auth/refresh/route.ts`
- `app/api/auth/logout/route.ts`
- `lib/auth.ts` (helpers JWT)
- `middleware/auth.ts` (vérification token)

### Technologies recommandées

- **JWT** : `jsonwebtoken` ou `jose`
- **Hashing** : `bcrypt` ou `argon2`
- **Sessions** : Redis (optionnel) ou JWT stateless

### Modèles requis

- ✅ `User` (déjà créé)
- Sessions/Tokens (optionnel)

---

## ⚙️ Phase 2 : Device Config & Measurements

### Routes à créer

```
GET    /api/devices/:uid/config         # Config d'un device par UID
POST   /api/devices/:uid/measurements   # Poster une mesure (IoT)
```

### Fichiers à créer

- `app/api/devices/[uid]/config/route.ts`
- `app/api/devices/[uid]/measurements/route.ts`

### Modèles requis

- ✅ `DeviceConfig` (déjà créé)
- ✅ `SensorMeasurement` (déjà créé)

### Notes

- `:uid` = serialNumber du device (pas l'ID MongoDB)
- Route `/measurements` utilisée par les devices IoT pour envoyer des données

---

## 🎛️ Phase 3 : Device Commands

### Routes à créer

```
POST   /api/devices/:id/commands/shutdown  # Éteindre un device
POST   /api/devices/:id/commands/reboot    # Redémarrer un device
POST   /api/devices/:id/commands/led       # Contrôler la LED
```

### Fichiers à créer

- `app/api/devices/[id]/commands/shutdown/route.ts`
- `app/api/devices/[id]/commands/reboot/route.ts`
- `app/api/devices/[id]/commands/led/route.ts`

### Modèles requis

- ✅ `DeviceCommand` (déjà créé)

### Exemples de payload

```json
// POST /api/devices/123/commands/led
{
  "color": "green",
  "mode": "blink",
  "duration": 5000
}
```

---

## 🏠 Phase 4 : Rooms (CRUD complet)

### Routes à créer

```
GET    /api/rooms          # Liste des salles
POST   /api/rooms          # Créer une salle
GET    /api/rooms/:id      # Détails d'une salle
PATCH  /api/rooms/:id      # Modifier une salle
```

### Fichiers à créer

- `app/api/rooms/route.ts`
- `app/api/rooms/[id]/route.ts`

### Modèles requis

- ✅ `Room` (déjà créé)
- ✅ `Building` (déjà créé)

---

## 📊 Phase 5 : Room Status & Measurements

### Routes à créer

```
GET    /api/rooms/:id/status        # Statut d'une salle spécifique
GET    /api/devices/:id/measurements # Mesures d'un device
GET    /api/rooms/:id/measurements   # Mesures d'une salle
```

### Fichiers à créer

- `app/api/rooms/[id]/status/route.ts`
- `app/api/devices/[id]/measurements/route.ts`
- `app/api/rooms/[id]/measurements/route.ts`

### Modèles requis

- ✅ Tous déjà créés

---

## 🌐 Phase 6 : Routes publiques (sans auth)

### Routes à créer

```
GET    /api/public/rooms/status    # Statut public des salles
GET    /api/public/rooms/:id       # Info publique d'une salle
```

### Fichiers à créer

- `app/api/public/rooms/status/route.ts`
- `app/api/public/rooms/[id]/route.ts`

### Notes

- Accessible sans authentification (dashboard étudiant)
- Données limitées (pas d'infos sensibles)

---

## 🔧 Phase 7 : Routes Admin

### Routes à créer

```
GET    /api/admin/health          # Health check détaillé
GET    /api/admin/devices/stats   # Statistiques des devices
```

### Fichiers à créer

- `app/api/admin/health/route.ts` (améliorer l'existant)
- `app/api/admin/devices/stats/route.ts`

### Notes

- Accessible uniquement aux SUPERVISOR
- Stats : nb devices online/offline, battery moyenne, etc.

---

## 📈 Estimation du travail

| Phase | Routes | Complexité | Temps estimé |
|-------|--------|------------|--------------|
| 1. Auth | 3 | ⭐⭐⭐ Haute | 2-3h |
| 2. Config | 2 | ⭐⭐ Moyenne | 1h |
| 3. Commands | 3 | ⭐⭐ Moyenne | 1h |
| 4. Rooms CRUD | 4 | ⭐ Basse | 1h |
| 5. Measurements | 3 | ⭐⭐ Moyenne | 1h |
| 6. Public | 2 | ⭐ Basse | 30min |
| 7. Admin | 2 | ⭐ Basse | 30min |
| 8. Swagger | - | ⭐⭐ Moyenne | 1h |
| **TOTAL** | **21** | | **~9h** |

---

## 🎯 Recommandations

### 1. Commencer par quoi ?

**Option A : Par ordre de priorité business**
1. Auth (bloquer pour sécuriser)
2. Public routes (dashboard étudiant)
3. Rooms CRUD (gérer les salles)
4. Commands (contrôle IoT)

**Option B : Par ordre de facilité (quick wins)**
1. Rooms CRUD (facile, modèles existent)
2. Public routes (copie des routes existantes)
3. Measurements (modèles existent)
4. Auth (plus complexe)

### 2. Architecture recommandée

```
app/api/
├── auth/
│   ├── login/route.ts
│   ├── refresh/route.ts
│   └── logout/route.ts
├── devices/
│   ├── route.ts ✅
│   ├── [id]/
│   │   ├── route.ts ✅
│   │   ├── measurements/route.ts
│   │   └── commands/
│   │       ├── shutdown/route.ts
│   │       ├── reboot/route.ts
│   │       └── led/route.ts
│   └── [uid]/
│       ├── config/route.ts
│       └── measurements/route.ts
├── rooms/
│   ├── route.ts
│   ├── status/route.ts ✅
│   └── [id]/
│       ├── route.ts
│       ├── status/route.ts
│       └── measurements/route.ts
├── public/
│   └── rooms/
│       ├── status/route.ts
│       └── [id]/route.ts
└── admin/
    ├── health/route.ts ✅
    └── devices/
        └── stats/route.ts
```

### 3. Middleware d'authentification

Créer un middleware pour protéger les routes :

```typescript
// middleware/requireAuth.ts
export async function requireAuth(request: NextRequest) {
  const token = request.headers.get('authorization')?.split(' ')[1];
  if (!token) throw new Error('Unauthorized');
  
  const user = await verifyToken(token);
  return user;
}

// middleware/requireRole.ts
export async function requireRole(user: IUser, role: UserRole) {
  if (user.role !== role) throw new Error('Forbidden');
}
```

---

## 🚀 Par où commencer ?

Je recommande de **commencer par les routes les plus simples** pour avoir des quick wins :

### Sprint 1 (2h) - Routes simples
1. ✅ Rooms CRUD (`/api/rooms`)
2. ✅ Room status par ID (`/api/rooms/:id/status`)
3. ✅ Public routes (`/api/public/rooms/*`)

### Sprint 2 (2h) - Measurements & Stats
1. ✅ Device measurements (`/api/devices/:id/measurements`)
2. ✅ Room measurements (`/api/rooms/:id/measurements`)
3. ✅ Admin stats (`/api/admin/devices/stats`)

### Sprint 3 (3h) - Auth & Security
1. ✅ Login/Refresh/Logout
2. ✅ Middleware d'authentification
3. ✅ Protéger les routes sensibles

### Sprint 4 (2h) - IoT Features
1. ✅ Device config par UID
2. ✅ Device commands (shutdown, reboot, led)
3. ✅ POST measurements par UID

---

## 📝 Checklist finale

- [ ] 21 nouvelles routes créées
- [ ] Authentification JWT implémentée
- [ ] Middleware de protection des routes
- [ ] Documentation Swagger complète
- [ ] Tests de toutes les routes
- [ ] Déploiement sur Railway
- [ ] Mise à jour de la documentation

---

## 💡 Voulez-vous que je commence ?

**Option 1** : Je crée toutes les routes automatiquement (9h de travail)

**Option 2** : Je crée un sprint à la fois (recommandé)

**Option 3** : Vous me dites par quelle phase commencer

Quelle approche préférez-vous ? 🚀

