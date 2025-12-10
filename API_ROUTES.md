# Routes API disponibles

## 📋 Devices

### GET /api/devices
Récupérer tous les devices avec filtres optionnels.

**Query Parameters:**
- `roomId` (optionnel) - Filtrer par salle
- `status` (optionnel) - Filtrer par statut (ONLINE, OFFLINE, ERROR, UNKNOWN)

**Exemple:**
```bash
curl http://localhost:3000/api/devices?status=ONLINE
```

**Réponse:**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "_id": "...",
      "serialNumber": "ESP32-001",
      "name": "Capteur Salle 101",
      "roomId": {...},
      "status": "ONLINE",
      "firmwareVersion": "1.0.0",
      "batteryLevel": 95.5,
      "isPoweredOn": true,
      "lastSeenAt": "2025-12-10T10:30:00Z"
    }
  ]
}
```

### POST /api/devices
Créer un nouveau device.

**Body:**
```json
{
  "serialNumber": "ESP32-001",
  "name": "Capteur Salle 101",
  "roomId": "675...",
  "status": "ONLINE",
  "firmwareVersion": "1.0.0",
  "batteryLevel": 95.5,
  "isPoweredOn": true
}
```

**Exemple:**
```bash
curl -X POST http://localhost:3000/api/devices \
  -H "Content-Type: application/json" \
  -d '{"serialNumber":"ESP32-001","name":"Capteur Salle 101"}'
```

### GET /api/devices/[id]
Récupérer un device spécifique.

**Exemple:**
```bash
curl http://localhost:3000/api/devices/675...
```

### PATCH /api/devices/[id]
Mettre à jour un device.

**Body (tous les champs optionnels):**
```json
{
  "name": "Nouveau nom",
  "status": "OFFLINE",
  "batteryLevel": 80.0
}
```

**Exemple:**
```bash
curl -X PATCH http://localhost:3000/api/devices/675... \
  -H "Content-Type: application/json" \
  -d '{"status":"OFFLINE"}'
```

### DELETE /api/devices/[id]
Supprimer un device.

**Exemple:**
```bash
curl -X DELETE http://localhost:3000/api/devices/675...
```

---

## 🏠 Rooms Status

### GET /api/rooms/status
Récupérer le statut de toutes les salles (utile pour le dashboard étudiant).

**Query Parameters:**
- `buildingId` (optionnel) - Filtrer par bâtiment
- `availability` (optionnel) - Filtrer par disponibilité (AVAILABLE, OCCUPIED, UNKNOWN)

**Exemple:**
```bash
curl http://localhost:3000/api/rooms/status?availability=AVAILABLE
```

**Réponse:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "...",
      "availability": "AVAILABLE",
      "lastUpdateAt": "2025-12-10T10:30:00Z",
      "reason": "Pas de détection NFC",
      "room": {
        "_id": "...",
        "name": "Salle 101",
        "floor": 1,
        "capacity": 30,
        "mapX": 100,
        "mapY": 200
      },
      "building": {
        "_id": "...",
        "name": "Bâtiment A"
      }
    }
  ]
}
```

---

## 📊 Sensor Measurements

### GET /api/sensors/[sensorId]/measurements
Récupérer les mesures d'un capteur.

**Query Parameters:**
- `startDate` (optionnel) - Date de début (ISO 8601)
- `endDate` (optionnel) - Date de fin (ISO 8601)
- `limit` (optionnel, défaut: 100) - Nombre max de mesures

**Exemple:**
```bash
# Mesures des dernières 24h
curl "http://localhost:3000/api/sensors/675.../measurements?startDate=2025-12-09T00:00:00Z&limit=1000"
```

**Réponse:**
```json
{
  "success": true,
  "sensor": {
    "id": "...",
    "type": "TEMPERATURE",
    "label": "Température ambiante",
    "unit": "°C"
  },
  "count": 144,
  "stats": {
    "count": 144,
    "avg": 22.3,
    "min": 20.1,
    "max": 24.5,
    "latest": 22.5
  },
  "data": [
    {
      "_id": "...",
      "sensorId": "...",
      "measuredAt": "2025-12-10T10:30:00Z",
      "numericValue": 22.5,
      "createdAt": "2025-12-10T10:30:01Z"
    }
  ]
}
```

### POST /api/sensors/[sensorId]/measurements
Ajouter une nouvelle mesure.

**Body:**
```json
{
  "numericValue": 22.5,
  "measuredAt": "2025-12-10T10:30:00Z",
  "rawValue": {
    "humidity": 45.2,
    "pressure": 1013.25
  }
}
```

**Exemple:**
```bash
curl -X POST http://localhost:3000/api/sensors/675.../measurements \
  -H "Content-Type: application/json" \
  -d '{"numericValue":22.5}'
```

---

## 🔧 Routes à créer (exemples)

Vous pouvez créer d'autres routes API suivant le même pattern :

### Buildings
- `GET /api/buildings` - Liste des bâtiments
- `POST /api/buildings` - Créer un bâtiment
- `GET /api/buildings/[id]` - Détails d'un bâtiment
- `PATCH /api/buildings/[id]` - Modifier un bâtiment

### Rooms
- `GET /api/rooms` - Liste des salles
- `POST /api/rooms` - Créer une salle
- `GET /api/rooms/[id]` - Détails d'une salle

### Sensors
- `GET /api/sensors` - Liste des capteurs
- `POST /api/sensors` - Créer un capteur
- `GET /api/sensors/[id]` - Détails d'un capteur

### Commands
- `POST /api/devices/[id]/commands` - Envoyer une commande
- `GET /api/devices/[id]/commands` - Historique des commandes

### NFC
- `POST /api/nfc/events` - Enregistrer un événement NFC
- `GET /api/nfc/events` - Historique des événements

---

## 🧪 Tester les routes

### Avec cURL

```bash
# GET
curl http://localhost:3000/api/devices

# POST
curl -X POST http://localhost:3000/api/devices \
  -H "Content-Type: application/json" \
  -d '{"serialNumber":"TEST-001"}'

# PATCH
curl -X PATCH http://localhost:3000/api/devices/675... \
  -H "Content-Type: application/json" \
  -d '{"status":"ONLINE"}'
```

### Avec JavaScript/TypeScript

```typescript
// GET
const response = await fetch('/api/devices');
const data = await response.json();

// POST
const response = await fetch('/api/devices', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    serialNumber: 'ESP32-001',
    name: 'Capteur Salle 101',
  }),
});

// PATCH
const response = await fetch(`/api/devices/${id}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ status: 'OFFLINE' }),
});
```

### Avec Postman ou Thunder Client

1. Importez les routes ci-dessus
2. Configurez l'URL de base : `http://localhost:3000`
3. Testez chaque endpoint

---

## 📝 Codes de statut HTTP

- `200 OK` - Requête réussie
- `201 Created` - Ressource créée avec succès
- `400 Bad Request` - Données invalides
- `404 Not Found` - Ressource non trouvée
- `409 Conflict` - Conflit (ex: doublon)
- `500 Internal Server Error` - Erreur serveur

## 🔐 Authentification (à implémenter)

Pour sécuriser vos routes, vous pouvez ajouter un middleware d'authentification :

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Vérifier le token d'authentification
  const token = request.headers.get('authorization');
  
  if (!token) {
    return NextResponse.json(
      { error: 'Non authentifié' },
      { status: 401 }
    );
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

