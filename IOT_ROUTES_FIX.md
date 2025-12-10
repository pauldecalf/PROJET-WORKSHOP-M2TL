# 🔧 Correction : Routes IoT déplacées

## ❌ Problème initial

```
Error: You cannot use different slug names for the same dynamic path ('id' !== 'uid').
```

**Cause** : Next.js ne permet pas d'avoir deux paramètres dynamiques différents au même niveau :

```
❌ /api/devices/[id]/...        (ID MongoDB)
❌ /api/devices/[uid]/...        (serialNumber)
     ↑ Conflit ! Même niveau, noms différents
```

---

## ✅ Solution appliquée

Les routes utilisées par les **devices IoT** ont été déplacées vers `/api/iot/devices/[serialNumber]/` :

### Avant (❌ Conflit)

```
/api/devices/[id]/route.ts
/api/devices/[id]/measurements/route.ts
/api/devices/[uid]/config/route.ts         ← Conflit avec [id]
/api/devices/[uid]/measurements/route.ts   ← Conflit avec [id]
```

### Après (✅ Résolu)

```
/api/devices/[id]/route.ts
/api/devices/[id]/measurements/route.ts
/api/iot/devices/[serialNumber]/config/route.ts         ← Séparé !
/api/iot/devices/[serialNumber]/measurements/route.ts   ← Séparé !
```

---

## 🗺️ Nouvelles routes IoT

| Ancienne route | Nouvelle route | Description |
|----------------|----------------|-------------|
| `GET /api/devices/{uid}/config` | `GET /api/iot/devices/{serialNumber}/config` | Config du device |
| `POST /api/devices/{uid}/measurements` | `POST /api/iot/devices/{serialNumber}/measurements` | Envoyer des mesures |

---

## 📝 Changements dans le code

### 1. Structure des dossiers

```
app/api/
├── devices/
│   └── [id]/                      ← ID MongoDB
│       ├── route.ts
│       ├── measurements/route.ts
│       └── commands/
│           ├── shutdown/route.ts
│           ├── reboot/route.ts
│           └── led/route.ts
└── iot/
    └── devices/
        └── [serialNumber]/        ← Serial Number (ex: ESP32-001)
            ├── config/route.ts
            └── measurements/route.ts
```

### 2. Paramètres renommés

**Avant** :
```typescript
{ params }: { params: Promise<{ uid: string }> }
const { uid } = await params;
const device = await Device.findOne({ serialNumber: uid });
```

**Après** :
```typescript
{ params }: { params: Promise<{ serialNumber: string }> }
const { serialNumber } = await params;
const device = await Device.findOne({ serialNumber });
```

### 3. Tags Swagger ajoutés

Un nouveau tag **"IoT Devices"** a été créé dans `lib/swagger.ts` :

```typescript
{
  name: 'IoT Devices',
  description: '🤖 Routes pour les devices IoT (config et mesures par serialNumber)',
}
```

---

## 🔄 Migration pour les devices IoT

Si vous avez des **devices ESP32 déjà configurés**, mettez à jour leurs URLs :

### Avant
```cpp
// ESP32 code (ANCIEN)
String configUrl = "http://api.example.com/api/devices/" + serialNumber + "/config";
String postUrl = "http://api.example.com/api/devices/" + serialNumber + "/measurements";
```

### Après
```cpp
// ESP32 code (NOUVEAU)
String configUrl = "http://api.example.com/api/iot/devices/" + serialNumber + "/config";
String postUrl = "http://api.example.com/api/iot/devices/" + serialNumber + "/measurements";
```

---

## 🧪 Tester les nouvelles routes

### 1. Récupérer la config d'un device

**Ancienne URL** :
```bash
curl http://localhost:3000/api/devices/ESP32-001/config
```

**Nouvelle URL** :
```bash
curl http://localhost:3000/api/iot/devices/ESP32-001/config
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
  "config": {
    "measurementIntervalSec": 60,
    "wifiSsid": "IoT-Network",
    "mqttBrokerUrl": "mqtt://broker.example.com"
  }
}
```

### 2. Envoyer des mesures

**Ancienne URL** :
```bash
curl -X POST http://localhost:3000/api/devices/ESP32-001/measurements \
  -H "Content-Type: application/json" \
  -d '{"measurements": [...]}'
```

**Nouvelle URL** :
```bash
curl -X POST http://localhost:3000/api/iot/devices/ESP32-001/measurements \
  -H "Content-Type: application/json" \
  -d '{
    "measurements": [
      {"sensorType": "TEMPERATURE", "value": 23.5, "unit": "°C"},
      {"sensorType": "HUMIDITY", "value": 45.2, "unit": "%"}
    ]
  }'
```

**Réponse** :
```json
{
  "success": true,
  "saved": 2,
  "data": [...]
}
```

---

## 📚 Documentation Swagger

Les routes IoT sont maintenant dans un **tag séparé** dans Swagger UI :

1. Allez sur http://localhost:3000/api-docs
2. Cherchez la section **"IoT Devices"** 🤖
3. Vous y trouverez :
   - `GET /api/iot/devices/{serialNumber}/config`
   - `POST /api/iot/devices/{serialNumber}/measurements`

---

## ✅ Build réussi

```
Route (app)
├ ƒ /api/devices/[id]                              ← ID MongoDB
├ ƒ /api/devices/[id]/measurements
├ ƒ /api/iot/devices/[serialNumber]/config         ← serialNumber
├ ƒ /api/iot/devices/[serialNumber]/measurements   ← serialNumber
```

**Plus de conflit !** ✅

---

## 🎯 Résumé

| Aspect | Changement |
|--------|-----------|
| **Routes Admin** | `/api/devices/[id]/*` (ID MongoDB) |
| **Routes IoT** | `/api/iot/devices/[serialNumber]/*` (Serial Number) |
| **Paramètre** | `uid` → `serialNumber` (plus explicite) |
| **Tag Swagger** | Nouveau tag "IoT Devices" |
| **Build** | ✅ Passe sans erreur |

---

## 🚀 Déploiement

1. **Committez les changements** :
   ```bash
   git add .
   git commit -m "fix: Move IoT routes to /api/iot/devices/[serialNumber] to avoid slug conflict"
   git push
   ```

2. **Railway redéploie automatiquement**

3. **Mettez à jour vos devices ESP32** avec les nouvelles URLs

---

## 💡 Avantages de cette structure

1. **Séparation claire** : Routes admin vs routes IoT
2. **Noms explicites** : `[id]` (MongoDB) vs `[serialNumber]` (Device)
3. **Scalabilité** : Facile d'ajouter d'autres routes IoT dans `/api/iot/`
4. **Documentation** : Tag Swagger dédié pour les routes IoT

---

**Date de correction** : 10 décembre 2025  
**Build status** : ✅ Succès

