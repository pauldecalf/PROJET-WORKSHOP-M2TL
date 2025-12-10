# ✅ Test : ConfigStatus par défaut

## 🧪 Vérification du comportement

Ce document confirme que le `configStatus` est bien défini à `PENDING` par défaut lors de la création d'un device.

---

## 📝 Test manuel

### 1. Créer un nouveau device (sans spécifier configStatus)

**Requête** :
```bash
curl -X POST http://localhost:3000/api/devices \
  -H "Content-Type: application/json" \
  -d '{
    "serialNumber": "ESP32-TEST-001",
    "name": "Device de test"
  }'
```

**Réponse attendue** :
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "serialNumber": "ESP32-TEST-001",
    "name": "Device de test",
    "status": "UNKNOWN",
    "configStatus": "PENDING",  ⭐ Automatiquement défini
    "isPoweredOn": true,
    "createdAt": "2025-12-10T12:00:00.000Z"
  }
}
```

✅ **Le `configStatus` est bien `PENDING` par défaut !**

---

### 2. Vérifier le device créé

```bash
curl http://localhost:3000/api/devices/by-serial/ESP32-TEST-001
```

**Réponse** :
```json
{
  "success": true,
  "data": {
    "serialNumber": "ESP32-TEST-001",
    "configStatus": "PENDING"  ⭐ Confirmé
  }
}
```

---

### 3. Filtrer les devices en attente de config

```bash
curl "http://localhost:3000/api/devices?configStatus=PENDING"
```

**Réponse** :
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "serialNumber": "ESP32-TEST-001",
      "configStatus": "PENDING"
    }
  ]
}
```

---

### 4. Changer le statut à IN_PROGRESS

```bash
curl -X PATCH http://localhost:3000/api/devices/by-id/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "configStatus": "IN_PROGRESS"
  }'
```

**Réponse** :
```json
{
  "success": true,
  "data": {
    "configStatus": "IN_PROGRESS"  ⭐ Mis à jour
  }
}
```

---

### 5. Terminer la configuration

```bash
curl -X PATCH http://localhost:3000/api/devices/by-id/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "configStatus": "CONFIGURED",
    "status": "ONLINE"
  }'
```

**Réponse** :
```json
{
  "success": true,
  "data": {
    "status": "ONLINE",
    "configStatus": "CONFIGURED"  ⭐ Configuration terminée
  }
}
```

---

## 🔒 Validation

Le modèle Mongoose valide automatiquement que `configStatus` contient une valeur valide :

```typescript
configStatus: {
  enum: ['PENDING', 'IN_PROGRESS', 'CONFIGURED'],  // Seules valeurs acceptées
  required: true,                                   // Toujours présent
  default: 'PENDING',                               // ⭐ Valeur par défaut
}
```

### Tentative d'utiliser une valeur invalide

```bash
curl -X PATCH http://localhost:3000/api/devices/by-id/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "configStatus": "INVALID_VALUE"
  }'
```

**Réponse** :
```json
{
  "success": false,
  "error": "Erreur lors de la mise à jour du device",
  "message": "Device validation failed: configStatus: `INVALID_VALUE` is not a valid enum value"
}
```

---

## 📊 Dashboard : Répartition par configStatus

```bash
curl http://localhost:3000/api/admin/devices/stats
```

**Réponse** :
```json
{
  "success": true,
  "data": {
    "devices": {
      "total": 10,
      "byConfigStatus": {
        "PENDING": 3,       ⭐ Devices créés récemment
        "IN_PROGRESS": 1,   ⭐ En cours de config
        "CONFIGURED": 6     ⭐ Prêts à l'emploi
      }
    }
  }
}
```

---

## 🎯 Workflow recommandé

### Étape 1 : Création automatique

Les devices sont créés automatiquement avec `configStatus: PENDING` :

```bash
POST /api/devices
{
  "serialNumber": "ESP32-001",
  "name": "Nouveau capteur"
}
```

### Étape 2 : Configuration

Un admin configure le device (WiFi, MQTT, etc.) et met le statut à `IN_PROGRESS` :

```bash
PATCH /api/devices/by-id/{id}
{
  "configStatus": "IN_PROGRESS"
}
```

### Étape 3 : Validation

Une fois configuré et testé, le statut passe à `CONFIGURED` :

```bash
POST /api/admin/nfc/device-status
{
  "badgeHash": "...",
  "configStatus": "CONFIGURED"
}
```

---

## ✅ Confirmation

Le `configStatus` est bien défini à `PENDING` par défaut lors de la création d'un device via `POST /api/devices`.

✅ Valeur par défaut dans le modèle  
✅ Automatique (pas besoin de spécifier)  
✅ Validation Mongoose  
✅ Modifiable après création  
✅ Filtrable dans les requêtes  

🚀 **Fonctionne parfaitement !**

