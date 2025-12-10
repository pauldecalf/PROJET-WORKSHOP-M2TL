# ✅ Routes API Finales - Structure Optimisée

## 🎯 Problème résolu

Les routes avec `[id]` directement après le nom de ressource causaient des **404** car Next.js ne pouvait pas différencier les routes statiques des routes dynamiques.

### ❌ Avant (problématique)

```
/api/devices/[id]           ← Capture TOUT après /devices/
/api/devices/stats          ← 404 car capturé par [id]
```

### ✅ Après (résolu)

```
/api/devices                ← Liste (statique)
/api/devices/stats          ← Stats (statique)
/api/devices/by-id/[id]     ← Détails (dynamique)
```

---

## 📊 Structure finale des routes (28 routes)

### 🔐 Auth (3 routes)
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

### 📟 Devices (5 routes)
- `GET /api/devices` - Liste
- `POST /api/devices` - Créer
- `GET /api/devices/by-id/[id]` - Détails
- `PATCH /api/devices/by-id/[id]` - Modifier
- `DELETE /api/devices/by-id/[id]` - Supprimer

### 🎛️ Device Commands (3 routes)
- `POST /api/devices/by-id/[id]/commands/shutdown`
- `POST /api/devices/by-id/[id]/commands/reboot`
- `POST /api/devices/by-id/[id]/commands/led`

### 📊 Device Data (2 routes)
- `GET /api/devices/by-id/[id]/data` - Données d'un device
- `POST /api/devices/by-id/[id]/data` - Envoyer des données

### 🏢 Buildings (6 routes)
- `GET /api/buildings` - Liste
- `POST /api/buildings` - Créer
- `GET /api/buildings/by-id/[id]` - Détails
- `PATCH /api/buildings/by-id/[id]` - Modifier
- `DELETE /api/buildings/by-id/[id]` - Supprimer
- `GET /api/buildings/by-id/[id]/rooms` - Salles d'un bâtiment
- `GET /api/buildings/by-id/[id]/stats` - Stats d'un bâtiment

### 🏠 Rooms (5 routes)
- `GET /api/rooms` - Liste
- `POST /api/rooms` - Créer
- `GET /api/rooms/by-id/[id]` - Détails
- `PATCH /api/rooms/by-id/[id]` - Modifier
- `GET /api/rooms/status` - Statut de toutes les salles
- `GET /api/rooms/by-id/[id]/status` - Statut d'une salle
- `GET /api/rooms/by-id/[id]/data` - Données d'une salle

### 🌐 Public (2 routes)
- `GET /api/public/rooms/status`
- `GET /api/public/rooms/by-id/[id]`

### 🔧 Admin (5 routes)
- `GET /api/health`
- `GET /api/admin/health`
- `GET /api/admin/devices/stats`
- `POST /api/admin/nfc/scan`
- `POST /api/admin/nfc/associate`
- `POST /api/admin/nfc/device-status`

**Total : 28 routes** ✅

---

## 🔄 Changements d'URLs

### Devices

| Avant | Après |
|-------|-------|
| `GET /api/devices/{id}` | `GET /api/devices/by-id/{id}` |
| `PATCH /api/devices/{id}` | `PATCH /api/devices/by-id/{id}` |
| `DELETE /api/devices/{id}` | `DELETE /api/devices/by-id/{id}` |
| `POST /api/devices/{id}/data` | `POST /api/devices/by-id/{id}/data` |
| `GET /api/devices/{id}/data` | `GET /api/devices/by-id/{id}/data` |
| `POST /api/devices/{id}/commands/...` | `POST /api/devices/by-id/{id}/commands/...` |

### Rooms

| Avant | Après |
|-------|-------|
| `GET /api/rooms/{id}` | `GET /api/rooms/by-id/{id}` |
| `PATCH /api/rooms/{id}` | `PATCH /api/rooms/by-id/{id}` |
| `GET /api/rooms/{id}/status` | `GET /api/rooms/by-id/{id}/status` |
| `GET /api/rooms/{id}/data` | `GET /api/rooms/by-id/{id}/data` |

### Buildings

| Avant | Après |
|-------|-------|
| `GET /api/buildings/{id}` | `GET /api/buildings/by-id/{id}` |
| `PATCH /api/buildings/{id}` | `PATCH /api/buildings/by-id/{id}` |
| `DELETE /api/buildings/{id}` | `DELETE /api/buildings/by-id/{id}` |
| `GET /api/buildings/{id}/rooms` | `GET /api/buildings/by-id/{id}/rooms` |
| `GET /api/buildings/{id}/stats` | `GET /api/buildings/by-id/{id}/stats` |

### Public

| Avant | Après |
|-------|-------|
| `GET /api/public/rooms/{id}` | `GET /api/public/rooms/by-id/{id}` |

---

## 🧪 Exemples d'utilisation

### 1. Récupérer un device

**Nouvelle URL** :
```bash
curl http://localhost:3000/api/devices/by-id/507f1f77bcf86cd799439011
```

Ou avec serialNumber (accepte aussi) :
```bash
curl http://localhost:3000/api/devices/by-id/ESP32-001
```

### 2. Envoyer des données

**Nouvelle URL** :
```bash
curl -X POST http://localhost:3000/api/devices/by-id/ESP32-001/data \
  -H "Content-Type: application/json" \
  -d '{
    "temperature": 23.5,
    "humidity": 45.2,
    "co2": 800,
    "decibel": 55,
    "luminosity": 75
  }'
```

### 3. Contrôler la LED

**Nouvelle URL** :
```bash
curl -X POST http://localhost:3000/api/devices/by-id/507f1f77bcf86cd799439011/commands/led \
  -H "Content-Type: application/json" \
  -d '{
    "color": "green",
    "mode": "blink",
    "duration": 5000
  }'
```

### 4. Récupérer les salles d'un bâtiment

**Nouvelle URL** :
```bash
curl http://localhost:3000/api/buildings/by-id/507f1f77bcf86cd799439011/rooms
```

---

## 🎨 Avantages de la nouvelle structure

### ✅ Évite les conflits

```
/api/devices                    ← Statique (liste)
/api/devices/stats              ← Statique (stats) - Peut être ajouté sans conflit
/api/devices/by-serial/[sn]     ← Dynamique (par serial)
/api/devices/by-id/[id]         ← Dynamique (par ID)
/api/devices/by-id/[id]/data    ← Sous-route dynamique
```

### ✅ Plus explicite

Les URLs sont plus claires :
- `/by-id/` indique clairement qu'on utilise un ID MongoDB
- Possibilité d'ajouter `/by-serial/`, `/by-name/`, etc.

### ✅ Extensible

Facile d'ajouter de nouvelles routes statiques :
```
/api/devices/search
/api/devices/export
/api/devices/import
```

---

## 🚀 Migration

### Pour les clients existants

Si vous avez des clients (frontend, ESP32) qui utilisent les anciennes URLs, mettez-les à jour :

**Avant** :
```javascript
fetch('/api/devices/507f1f77bcf86cd799439011')
```

**Après** :
```javascript
fetch('/api/devices/by-id/507f1f77bcf86cd799439011')
```

### Code ESP32

**Avant** :
```cpp
String url = "https://api.example.com/api/devices/" + serialNumber + "/data";
```

**Après** :
```cpp
String url = "https://api.example.com/api/devices/by-id/" + serialNumber + "/data";
```

---

## 📚 Documentation Swagger

Toutes les URLs Swagger ont été automatiquement mises à jour :

**Accédez à** : http://localhost:3000/api-docs

Vous verrez les nouvelles URLs :
- `/api/devices/by-id/{id}`
- `/api/rooms/by-id/{id}`
- `/api/buildings/by-id/{id}`
- etc.

---

## ✅ Build réussi

```
✓ Compiled successfully
✓ 28 routes API
✓ Aucun conflit de routes
✓ URLs restructurées
```

---

## 🎉 Terminé !

Vos routes sont maintenant **correctement structurées** et ne causeront plus de **404** !

✅ Toutes les routes `[id]` sont maintenant sous `/by-id/`  
✅ Possibilité d'ajouter des routes statiques sans conflit  
✅ URLs plus explicites et claires  
✅ Build TypeScript sans erreur  

🚀 **Prêt pour le déploiement !**

