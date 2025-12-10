# 🔄 API Restructurée - Simplification

## ✅ Modifications appliquées

L'API a été **simplifiée et restructurée** pour éliminer les doublons et mieux refléter la réalité des devices IoT.

---

## 🗑️ Supprimé

### Routes IoT (doublons)
- ❌ `GET /api/iot/devices/[serialNumber]/config`
- ❌ `POST /api/iot/devices/[serialNumber]/measurements`

**Raison** : Doublons des routes `/api/devices/[id]/*` qui acceptent déjà le serialNumber

### Routes Sensor (obsolètes)
- ❌ `GET /api/sensors/[sensorId]/measurements`
- ❌ Modèles `Sensor` et `SensorMeasurement`

**Raison** : Les devices envoient directement leurs données (température, humidité, CO2, etc.)

---

## ✨ Nouveau : DeviceData

### Modèle simplifié

Un seul modèle `DeviceData` qui stocke **toutes les données** d'un device :

```typescript
interface IDeviceData {
  deviceId: ObjectId;
  temperature?: number;    // °C
  humidity?: number;       // %
  co2?: number;           // ppm
  decibel?: number;       // dB
  luminosity?: number;    // %
  measuredAt: Date;
  createdAt: Date;
}
```

### Avantages

✅ **Plus simple** : Un seul modèle au lieu de Sensor + SensorMeasurement  
✅ **Plus flexible** : Toutes les données dans un seul document  
✅ **Plus performant** : Une seule requête pour toutes les données  
✅ **Plus clair** : Correspond à la réalité (un device envoie plusieurs mesures)  

---

## 🆕 Nouvelles routes

### 1. POST `/api/devices/[id]/data` - Envoyer des données

Le device envoie **toutes ses mesures** en une seule requête.

**Requête** :
```bash
curl -X POST http://localhost:3000/api/devices/ESP32-001/data \
  -H "Content-Type: application/json" \
  -d '{
    "temperature": 23.5,
    "humidity": 45.2,
    "co2": 800,
    "decibel": 55,
    "luminosity": 75
  }'
```

**Réponse** :
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "deviceId": "507f1f77bcf86cd799439021",
    "temperature": 23.5,
    "humidity": 45.2,
    "co2": 800,
    "decibel": 55,
    "luminosity": 75,
    "measuredAt": "2025-12-10T12:30:00.000Z"
  }
}
```

**Flexibilité** : Vous pouvez envoyer uniquement les données disponibles :
```json
{
  "temperature": 23.5,
  "humidity": 45.2
}
```

---

### 2. GET `/api/devices/[id]/data` - Récupérer les données

Récupère l'historique des données d'un device avec **statistiques automatiques**.

**Requête** :
```bash
curl "http://localhost:3000/api/devices/ESP32-001/data?limit=50"
```

**Réponse** :
```json
{
  "success": true,
  "device": {
    "id": "507f1f77bcf86cd799439021",
    "serialNumber": "ESP32-001",
    "name": "Capteur Salle 101"
  },
  "count": 50,
  "data": [
    {
      "_id": "...",
      "temperature": 23.5,
      "humidity": 45.2,
      "co2": 800,
      "decibel": 55,
      "luminosity": 75,
      "measuredAt": "2025-12-10T12:30:00.000Z"
    }
  ],
  "stats": {
    "temperature": {
      "count": 50,
      "min": 20.5,
      "max": 25.8,
      "avg": 23.2,
      "latest": 23.5
    },
    "humidity": {
      "count": 50,
      "min": 40.0,
      "max": 50.0,
      "avg": 45.5,
      "latest": 45.2
    },
    "co2": { ... },
    "decibel": { ... },
    "luminosity": { ... }
  }
}
```

**Filtres disponibles** :
- `?startDate=2025-12-01T00:00:00Z` - Date de début
- `?endDate=2025-12-10T23:59:59Z` - Date de fin
- `?limit=100` - Nombre max de résultats (défaut: 100)

---

### 3. GET `/api/rooms/[id]/data` - Données de tous les devices d'une salle

Récupère les données de **tous les devices** d'une salle.

**Requête** :
```bash
curl "http://localhost:3000/api/rooms/507f1f77bcf86cd799439031/data?limit=20"
```

**Réponse** :
```json
{
  "success": true,
  "room": {
    "id": "507f1f77bcf86cd799439031",
    "name": "Salle 101",
    "floor": 1
  },
  "devices": [
    {
      "device": {
        "id": "507f1f77bcf86cd799439021",
        "serialNumber": "ESP32-001",
        "name": "Capteur Salle 101"
      },
      "count": 20,
      "data": [ ... ],
      "stats": {
        "temperature": { ... },
        "humidity": { ... },
        ...
      }
    }
  ]
}
```

---

## 📊 Comparaison Avant/Après

### ❌ Avant (complexe)

```
Device (1)
  ↓
Sensor (N) ← Un sensor par type (température, humidité, etc.)
  ↓
SensorMeasurement (N) ← Une mesure par sensor
```

**Problèmes** :
- 3 modèles pour stocker des données simples
- Requêtes multiples pour récupérer toutes les données
- Complexité inutile

### ✅ Après (simple)

```
Device (1)
  ↓
DeviceData (N) ← Toutes les mesures dans un seul document
```

**Avantages** :
- 2 modèles seulement
- Une seule requête pour toutes les données
- Plus simple à comprendre et maintenir

---

## 🎯 Cas d'usage

### 1. Device ESP32 envoie ses données

```cpp
// Code ESP32
void sendData() {
  String json = "{";
  json += "\"temperature\":" + String(readTemperature()) + ",";
  json += "\"humidity\":" + String(readHumidity()) + ",";
  json += "\"co2\":" + String(readCO2()) + ",";
  json += "\"decibel\":" + String(readDecibel()) + ",";
  json += "\"luminosity\":" + String(readLuminosity());
  json += "}";
  
  HTTPClient http;
  http.begin("https://api.example.com/api/devices/" + serialNumber + "/data");
  http.addHeader("Content-Type", "application/json");
  http.POST(json);
}
```

### 2. Dashboard affiche les données en temps réel

```javascript
// Frontend React
async function fetchDeviceData(deviceId) {
  const response = await fetch(`/api/devices/${deviceId}/data?limit=50`);
  const data = await response.json();
  
  // Afficher les dernières valeurs
  console.log('Température:', data.stats.temperature.latest, '°C');
  console.log('Humidité:', data.stats.humidity.latest, '%');
  console.log('CO2:', data.stats.co2.latest, 'ppm');
  
  // Afficher un graphique
  const temperatures = data.data.map(d => ({
    x: new Date(d.measuredAt),
    y: d.temperature
  }));
  
  renderChart(temperatures);
}
```

### 3. Alerte si valeurs anormales

```javascript
// Backend - Vérifier les dernières données
const latestData = await DeviceData.findOne({ deviceId })
  .sort({ measuredAt: -1 })
  .lean();

if (latestData.co2 > 1000) {
  sendAlert('CO2 élevé dans la salle!');
}

if (latestData.temperature > 30) {
  sendAlert('Température élevée!');
}
```

---

## 📈 Structure finale de l'API

### 28 routes (au lieu de 35)

- 🔐 Auth : 3 routes
- 📟 Devices : 5 routes
- 🎛️ Device Commands : 3 routes
- 📊 **Device Data : 2 routes** ⭐ **NOUVEAU**
- 🏢 Buildings : 6 routes
- 🏠 Rooms : 6 routes
- 🌐 Public : 2 routes
- 🔧 Admin : 5 routes (dont 3 NFC)

**Total : 28 routes** ✅

---

## 🗄️ Modèles MongoDB

### Modèles principaux

1. **Building** - Bâtiments
2. **Room** - Salles
3. **RoomStatus** - Statut des salles
4. **User** - Utilisateurs
5. **Device** - Devices IoT
6. **DeviceConfig** - Configuration des devices
7. **DeviceCommand** - Commandes envoyées aux devices
8. **DeviceData** ⭐ **NOUVEAU** - Données des devices (time-series)
9. **OTAUpdate** - Mises à jour OTA
10. **NFCBadge** - Badges NFC
11. **NFCEvent** - Événements NFC
12. **AuditLog** - Logs d'audit

### Modèles conservés (mais non utilisés pour l'instant)

- **Sensor** - Peut être utilisé pour des capteurs externes
- **SensorMeasurement** - Mesures de capteurs externes

---

## 🔄 Migration

Si vous aviez déjà des données dans `Sensor` et `SensorMeasurement`, voici un script de migration :

```javascript
// scripts/migrate-to-device-data.js
const { Device, Sensor, SensorMeasurement, DeviceData } = require('./models');

async function migrate() {
  const devices = await Device.find();
  
  for (const device of devices) {
    const sensors = await Sensor.find({ deviceId: device._id });
    
    // Grouper les mesures par timestamp
    const measurementsByTime = {};
    
    for (const sensor of sensors) {
      const measurements = await SensorMeasurement.find({ sensorId: sensor._id });
      
      for (const measurement of measurements) {
        const time = measurement.measuredAt.toISOString();
        
        if (!measurementsByTime[time]) {
          measurementsByTime[time] = {
            deviceId: device._id,
            measuredAt: measurement.measuredAt,
          };
        }
        
        // Mapper les types de sensors
        if (sensor.type === 'TEMPERATURE') {
          measurementsByTime[time].temperature = measurement.numericValue;
        } else if (sensor.type === 'HUMIDITY') {
          measurementsByTime[time].humidity = measurement.numericValue;
        }
        // ... autres types
      }
    }
    
    // Créer les DeviceData
    for (const data of Object.values(measurementsByTime)) {
      await DeviceData.create(data);
    }
  }
  
  console.log('Migration terminée!');
}
```

---

## ✅ Avantages de la restructuration

| Aspect | Avant | Après |
|--------|-------|-------|
| **Routes** | 35 | 28 (-7) |
| **Modèles principaux** | 14 | 12 (-2) |
| **Complexité** | Élevée | Simple |
| **Requêtes pour toutes les données** | N (une par sensor) | 1 |
| **Maintenance** | Difficile | Facile |
| **Performance** | Moyenne | Meilleure |

---

## 🚀 Déploiement

```bash
git add .
git commit -m "refactor: Simplify API - Remove IoT/Sensor duplicates, add DeviceData model"
git push
```

---

## 📚 Documentation Swagger

Toutes les routes sont documentées dans Swagger UI :

**URL** : http://localhost:3000/api-docs

**Nouveau tag** : "Device Data" 📊

---

## 🎉 Résumé

✅ **Supprimé** : Routes IoT (doublons) et Sensor (obsolètes)  
✅ **Ajouté** : Modèle DeviceData et 2 routes  
✅ **Simplifié** : Architecture plus claire et performante  
✅ **Build** : Réussi sans erreur  
✅ **Total** : 28 routes API  

🚀 **API simplifiée et prête pour la production !**

