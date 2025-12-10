# 🔢 Routes par Serial Number

## ✅ Nouvelles routes créées

Deux nouvelles routes pour accéder aux devices **directement par leur Serial Number** (ex: `ESP32-001`).

---

## 📋 Routes ajoutées

### 1. GET `/api/devices/by-serial/{serialNumber}` - Récupérer un device

Récupère les détails d'un device en utilisant son **Serial Number** au lieu de son ID MongoDB.

**Requête** :
```bash
curl http://localhost:3000/api/devices/by-serial/ESP32-001
```

**Réponse** :
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "serialNumber": "ESP32-001",
    "name": "Capteur Salle 101",
    "roomId": {
      "_id": "507f1f77bcf86cd799439031",
      "name": "Salle 101"
    },
    "badgeId": {
      "_id": "507f1f77bcf86cd799439050",
      "badgeHash": "a1b2c3d4e5f6"
    },
    "status": "ONLINE",
    "configStatus": "CONFIGURED",
    "batteryLevel": 95.5,
    "lastSeenAt": "2025-12-10T12:30:00.000Z"
  }
}
```

**Avantages** :
- ✅ Pas besoin de connaître l'ID MongoDB
- ✅ URL plus lisible et mémorisable
- ✅ Parfait pour les devices IoT

---

### 2. GET `/api/devices/by-serial/{serialNumber}/data` - Récupérer les données

Récupère l'historique des données d'un device par son Serial Number.

**Requête** :
```bash
curl "http://localhost:3000/api/devices/by-serial/ESP32-001/data?limit=50"
```

**Avec filtres de date** :
```bash
curl "http://localhost:3000/api/devices/by-serial/ESP32-001/data?startDate=2025-12-01T00:00:00Z&endDate=2025-12-10T23:59:59Z&limit=100"
```

**Réponse** :
```json
{
  "success": true,
  "device": {
    "id": "507f1f77bcf86cd799439011",
    "serialNumber": "ESP32-001",
    "name": "Capteur Salle 101"
  },
  "count": 50,
  "data": [
    {
      "_id": "...",
      "deviceId": "507f1f77bcf86cd799439011",
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
    "humidity": { ... },
    "co2": { ... },
    "decibel": { ... },
    "luminosity": { ... }
  }
}
```

---

### 3. POST `/api/devices/by-serial/{serialNumber}/data` - Envoyer des données

Les devices IoT peuvent envoyer leurs données directement avec leur Serial Number.

**Requête** :
```bash
curl -X POST http://localhost:3000/api/devices/by-serial/ESP32-001/data \
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
    "_id": "507f1f77bcf86cd799439111",
    "deviceId": "507f1f77bcf86cd799439011",
    "temperature": 23.5,
    "humidity": 45.2,
    "co2": 800,
    "decibel": 55,
    "luminosity": 75,
    "measuredAt": "2025-12-10T12:35:00.000Z",
    "createdAt": "2025-12-10T12:35:00.000Z"
  }
}
```

---

## 💻 Code ESP32

### Exemple complet

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>

// Configuration
const char* ssid = "WiFi-Network";
const char* password = "password";
const char* apiUrl = "https://api.example.com/api/devices/by-serial";
const char* serialNumber = "ESP32-001";

// Capteurs
DHT dht(4, DHT22);
// ... autres capteurs

void setup() {
  Serial.begin(115200);
  
  // Connecter au WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ WiFi connecté");
  
  dht.begin();
}

void loop() {
  sendData();
  delay(60000); // Envoyer toutes les minutes
}

void sendData() {
  // Lire les capteurs
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  int co2 = readCO2Sensor();
  int decibel = readDecibelSensor();
  int luminosity = readLuminositySensor();
  
  // Construire le JSON
  String json = "{";
  json += "\"temperature\":" + String(temperature) + ",";
  json += "\"humidity\":" + String(humidity) + ",";
  json += "\"co2\":" + String(co2) + ",";
  json += "\"decibel\":" + String(decibel) + ",";
  json += "\"luminosity\":" + String(luminosity);
  json += "}";
  
  // Envoyer les données
  HTTPClient http;
  String url = String(apiUrl) + "/" + serialNumber + "/data";
  
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  
  int httpCode = http.POST(json);
  
  if (httpCode == 201) {
    Serial.println("✅ Données envoyées");
  } else {
    Serial.println("❌ Erreur: " + String(httpCode));
  }
  
  http.end();
}
```

---

## 🎯 Comparaison des routes

### Par ID MongoDB

```bash
# Nécessite de connaître l'ID MongoDB
GET /api/devices/by-id/507f1f77bcf86cd799439011
POST /api/devices/by-id/507f1f77bcf86cd799439011/data
```

**Avantages** :
- ✅ ID unique garanti par MongoDB
- ✅ Performance (index primaire)

**Inconvénients** :
- ❌ ID difficile à mémoriser
- ❌ Les devices doivent stocker leur ID

### Par Serial Number (NOUVEAU)

```bash
# Utilise le Serial Number (plus lisible)
GET /api/devices/by-serial/ESP32-001
POST /api/devices/by-serial/ESP32-001/data
```

**Avantages** :
- ✅ Serial Number lisible et mémorisable
- ✅ Les devices connaissent déjà leur Serial Number
- ✅ Plus simple pour le code ESP32

**Inconvénients** :
- ❌ Requiert un index sur `serialNumber` (déjà créé)

---

## 📊 Structure finale des routes

```
/api/devices
├── GET, POST                              ← Liste et création
├── by-id/
│   └── [id]/                              ← Par ID MongoDB
│       ├── GET, PATCH, DELETE
│       ├── data/
│       │   ├── GET                        ← Récupérer données
│       │   └── POST                       ← Envoyer données
│       └── commands/
│           ├── shutdown/
│           ├── reboot/
│           └── led/
└── by-serial/                             ⭐ NOUVEAU
    └── [serialNumber]/
        ├── GET                            ← Détails du device
        └── data/
            ├── GET                        ← Récupérer données
            └── POST                       ← Envoyer données
```

---

## 🧪 Tests

### 1. Récupérer un device

```bash
# Par ID
curl http://localhost:3000/api/devices/by-id/507f1f77bcf86cd799439011

# Par Serial Number (NOUVEAU)
curl http://localhost:3000/api/devices/by-serial/ESP32-001
```

### 2. Envoyer des données

```bash
# Par ID
curl -X POST http://localhost:3000/api/devices/by-id/507f1f77bcf86cd799439011/data \
  -H "Content-Type: application/json" \
  -d '{"temperature":23.5,"humidity":45.2}'

# Par Serial Number (NOUVEAU)
curl -X POST http://localhost:3000/api/devices/by-serial/ESP32-001/data \
  -H "Content-Type: application/json" \
  -d '{"temperature":23.5,"humidity":45.2}'
```

### 3. Récupérer les données

```bash
# Par ID
curl "http://localhost:3000/api/devices/by-id/507f1f77bcf86cd799439011/data?limit=50"

# Par Serial Number (NOUVEAU)
curl "http://localhost:3000/api/devices/by-serial/ESP32-001/data?limit=50"
```

---

## 🌐 Frontend React

```javascript
// Avec ID MongoDB
const device = await fetch('/api/devices/by-id/507f1f77bcf86cd799439011')
  .then(r => r.json());

// Avec Serial Number (plus lisible)
const device = await fetch('/api/devices/by-serial/ESP32-001')
  .then(r => r.json());

// Récupérer les données
const data = await fetch('/api/devices/by-serial/ESP32-001/data?limit=50')
  .then(r => r.json());
```

---

## 📚 Documentation Swagger

Les nouvelles routes sont documentées dans Swagger UI :

**Accédez à** : http://localhost:3000/api-docs

Vous verrez :
- `GET /api/devices/by-serial/{serialNumber}`
- `GET /api/devices/by-serial/{serialNumber}/data`
- `POST /api/devices/by-serial/{serialNumber}/data`

---

## ✅ Total des routes

**31 routes** au total (28 + 3 nouvelles) :

- 🔐 Auth : 3 routes
- 📟 Devices : 8 routes (5 + **3 nouvelles** ⭐)
- 🎛️ Device Commands : 3 routes
- 📊 Device Data : 2 routes
- 🏢 Buildings : 6 routes
- 🏠 Rooms : 5 routes
- 🌐 Public : 2 routes
- 🔧 Admin : 5 routes

---

## 🚀 Déploiement

```bash
git add .
git commit -m "feat: Add routes to access devices by serial number"
git push
```

---

## 🎉 Terminé !

Les devices peuvent maintenant être accédés **directement par leur Serial Number** !

✅ `GET /api/devices/by-serial/{serialNumber}`  
✅ `GET /api/devices/by-serial/{serialNumber}/data`  
✅ `POST /api/devices/by-serial/{serialNumber}/data`  
✅ Plus simple pour les ESP32  
✅ URLs plus lisibles  
✅ Build réussi  

🚀 **Prêt pour la production !**

