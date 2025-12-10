# 🏢 API Buildings - Documentation

## ✅ Routes créées

**6 nouvelles routes** pour la gestion des bâtiments ont été ajoutées !

---

## 📋 Liste des routes

### 1. CRUD Bâtiments (4 routes)

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/buildings` | Liste tous les bâtiments |
| POST | `/api/buildings` | Créer un nouveau bâtiment |
| GET | `/api/buildings/[id]` | Détails d'un bâtiment |
| PATCH | `/api/buildings/[id]` | Modifier un bâtiment |
| DELETE | `/api/buildings/[id]` | Supprimer un bâtiment |

### 2. Routes supplémentaires (2 routes)

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/buildings/[id]/rooms` | Liste des salles d'un bâtiment |
| GET | `/api/buildings/[id]/stats` | Statistiques d'un bâtiment |

---

## 📊 Modèle Building

### Interface TypeScript

```typescript
interface IBuilding {
  _id: string;
  name: string;              // Requis
  address?: string;          // Optionnel
  totalFloors?: number;      // Optionnel (1-100)
  mapImageUrl?: string;      // Optionnel (URL du plan)
  createdAt: Date;
}
```

### Exemple de document MongoDB

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Bâtiment A",
  "address": "123 Rue de l'Université",
  "totalFloors": 5,
  "mapImageUrl": "https://example.com/maps/building-a.png",
  "createdAt": "2025-12-10T12:00:00.000Z"
}
```

---

## 🧪 Exemples d'utilisation

### 1. Récupérer tous les bâtiments

**Requête** :
```bash
curl http://localhost:3000/api/buildings
```

**Réponse** :
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Bâtiment A",
      "address": "123 Rue de l'Université",
      "totalFloors": 5,
      "createdAt": "2025-12-10T12:00:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Bâtiment B",
      "address": "456 Avenue des Sciences",
      "totalFloors": 3,
      "createdAt": "2025-12-10T12:00:00.000Z"
    }
  ]
}
```

---

### 2. Créer un nouveau bâtiment

**Requête** :
```bash
curl -X POST http://localhost:3000/api/buildings \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bâtiment C",
    "address": "789 Boulevard de la Recherche",
    "totalFloors": 4,
    "mapImageUrl": "https://example.com/maps/building-c.png"
  }'
```

**Réponse** :
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "name": "Bâtiment C",
    "address": "789 Boulevard de la Recherche",
    "totalFloors": 4,
    "mapImageUrl": "https://example.com/maps/building-c.png",
    "createdAt": "2025-12-10T12:30:00.000Z"
  }
}
```

**Validation** :
- ✅ `name` est **requis**
- ✅ `totalFloors` doit être entre 1 et 100
- ✅ `address` max 255 caractères
- ✅ `mapImageUrl` max 500 caractères

---

### 3. Récupérer un bâtiment spécifique

**Requête** :
```bash
curl http://localhost:3000/api/buildings/507f1f77bcf86cd799439011
```

**Réponse** :
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Bâtiment A",
    "address": "123 Rue de l'Université",
    "totalFloors": 5,
    "mapImageUrl": "https://example.com/maps/building-a.png",
    "createdAt": "2025-12-10T12:00:00.000Z"
  }
}
```

---

### 4. Modifier un bâtiment

**Requête** :
```bash
curl -X PATCH http://localhost:3000/api/buildings/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bâtiment A - Rénové",
    "totalFloors": 6
  }'
```

**Réponse** :
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Bâtiment A - Rénové",
    "address": "123 Rue de l'Université",
    "totalFloors": 6,
    "mapImageUrl": "https://example.com/maps/building-a.png",
    "createdAt": "2025-12-10T12:00:00.000Z"
  }
}
```

---

### 5. Supprimer un bâtiment

**Requête** :
```bash
curl -X DELETE http://localhost:3000/api/buildings/507f1f77bcf86cd799439011
```

**Réponse (succès)** :
```json
{
  "success": true,
  "message": "Bâtiment supprimé avec succès"
}
```

**Réponse (erreur - salles associées)** :
```json
{
  "success": false,
  "error": "Impossible de supprimer ce bâtiment car il contient 5 salle(s)"
}
```

**⚠️ Important** : Un bâtiment ne peut être supprimé que s'il n'a **aucune salle associée**.

---

### 6. Récupérer les salles d'un bâtiment

**Requête** :
```bash
curl http://localhost:3000/api/buildings/507f1f77bcf86cd799439011/rooms
```

**Avec filtre par étage** :
```bash
curl http://localhost:3000/api/buildings/507f1f77bcf86cd799439011/rooms?floor=1
```

**Réponse** :
```json
{
  "success": true,
  "building": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Bâtiment A"
  },
  "count": 5,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439021",
      "buildingId": "507f1f77bcf86cd799439011",
      "name": "Salle 101",
      "floor": 1,
      "capacity": 30
    },
    {
      "_id": "507f1f77bcf86cd799439022",
      "buildingId": "507f1f77bcf86cd799439011",
      "name": "Salle 102",
      "floor": 1,
      "capacity": 25
    }
  ]
}
```

---

### 7. Statistiques d'un bâtiment

**Requête** :
```bash
curl http://localhost:3000/api/buildings/507f1f77bcf86cd799439011/stats
```

**Réponse** :
```json
{
  "success": true,
  "building": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Bâtiment A",
    "totalFloors": 5
  },
  "stats": {
    "rooms": {
      "total": 20,
      "byFloor": {
        "1": 5,
        "2": 5,
        "3": 5,
        "4": 3,
        "5": 2
      },
      "totalCapacity": 600
    },
    "devices": {
      "total": 15,
      "byStatus": {
        "ONLINE": 12,
        "OFFLINE": 2,
        "ERROR": 1
      }
    },
    "availability": {
      "available": 15,
      "occupied": 3,
      "unknown": 2
    }
  }
}
```

**Statistiques incluses** :
- **Salles** : Total, répartition par étage, capacité totale
- **Devices** : Total, répartition par statut (ONLINE, OFFLINE, ERROR)
- **Disponibilité** : Salles disponibles, occupées, statut inconnu

---

## 🔒 Sécurité et validation

### Validation des données

**POST /api/buildings** :
- ✅ `name` : Requis, max 100 caractères
- ✅ `address` : Optionnel, max 255 caractères
- ✅ `totalFloors` : Optionnel, entre 1 et 100
- ✅ `mapImageUrl` : Optionnel, max 500 caractères

**PATCH /api/buildings/[id]** :
- ✅ Tous les champs sont optionnels
- ✅ Validation identique au POST

**DELETE /api/buildings/[id]** :
- ✅ Vérifie qu'aucune salle n'est associée
- ✅ Retourne une erreur 400 si des salles existent

---

## 📚 Documentation Swagger

Toutes les routes sont documentées dans Swagger UI :

1. Accédez à : http://localhost:3000/api-docs
2. Cherchez le tag **"Buildings"** 🏢
3. Vous y trouverez les 6 routes avec :
   - Descriptions détaillées
   - Paramètres requis/optionnels
   - Exemples de requêtes/réponses
   - Schémas de validation

---

## 🗺️ Relations avec d'autres entités

### Building → Room (1:N)

Un bâtiment peut avoir **plusieurs salles** :

```
Building (1)
    ↓
Room (N)
    ↓
Device (N)
```

**Exemple de requêtes liées** :

1. Récupérer un bâtiment :
   ```bash
   GET /api/buildings/507f1f77bcf86cd799439011
   ```

2. Récupérer ses salles :
   ```bash
   GET /api/buildings/507f1f77bcf86cd799439011/rooms
   ```

3. Récupérer une salle spécifique :
   ```bash
   GET /api/rooms/507f1f77bcf86cd799439021
   ```

4. Récupérer les devices d'une salle :
   ```bash
   GET /api/devices?roomId=507f1f77bcf86cd799439021
   ```

---

## 🎯 Cas d'usage

### 1. Dashboard admin - Vue d'ensemble du campus

```javascript
// Récupérer tous les bâtiments avec leurs stats
const buildings = await fetch('/api/buildings').then(r => r.json());

for (const building of buildings.data) {
  const stats = await fetch(`/api/buildings/${building._id}/stats`).then(r => r.json());
  console.log(`${building.name}: ${stats.stats.rooms.total} salles, ${stats.stats.availability.available} disponibles`);
}
```

### 2. Affichage d'un plan de bâtiment

```javascript
// Récupérer le bâtiment avec son plan
const building = await fetch('/api/buildings/507f1f77bcf86cd799439011').then(r => r.json());

// Afficher l'image du plan
<img src={building.data.mapImageUrl} alt={building.data.name} />

// Récupérer les salles pour les afficher sur le plan
const rooms = await fetch(`/api/buildings/${building.data._id}/rooms`).then(r => r.json());
```

### 3. Filtrage par étage

```javascript
// Récupérer uniquement les salles du 1er étage
const floor1Rooms = await fetch('/api/buildings/507f1f77bcf86cd799439011/rooms?floor=1')
  .then(r => r.json());

console.log(`${floor1Rooms.count} salles au 1er étage`);
```

---

## 📊 Récapitulatif

| Aspect | Détails |
|--------|---------|
| **Routes créées** | 6 routes |
| **Tag Swagger** | Buildings 🏢 |
| **Modèle** | Building (name, address, totalFloors, mapImageUrl) |
| **Relations** | 1:N avec Room |
| **Validation** | name requis, totalFloors 1-100 |
| **Sécurité** | Empêche la suppression si salles associées |
| **Build** | ✅ Passe sans erreur |

---

## 🚀 Total des routes API

Avec l'ajout des routes Buildings, votre API compte maintenant **32 routes** :

- 🔐 Auth : 3 routes
- 📟 Devices : 5 routes
- 🤖 IoT Devices : 2 routes
- 🎛️ Device Commands : 3 routes
- 🏢 **Buildings : 6 routes** ⭐ **NOUVEAU**
- 🏠 Rooms : 6 routes
- 📊 Measurements : 3 routes
- 🌐 Public : 2 routes
- 🔧 Admin : 2 routes

**Total : 32 routes API** ✅

---

## 🎉 Prêt pour le déploiement !

```bash
git add .
git commit -m "feat: Add Buildings API (6 routes)"
git push
```

Railway déploiera automatiquement les nouvelles routes ! 🚀

