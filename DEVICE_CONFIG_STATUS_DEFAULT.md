# ⚙️ ConfigStatus par défaut - Documentation

## ✅ Comportement confirmé

Lors de la création d'un device via `POST /api/devices`, le champ `configStatus` est **automatiquement défini à `PENDING`** (en attente de configuration).

---

## 🔧 Configuration technique

### Modèle Device

Le champ `configStatus` a une valeur par défaut dans le schema Mongoose :

```typescript
// models/Device.ts
configStatus: {
  type: String,
  enum: Object.values(DeviceConfigStatus),
  required: true,
  default: DeviceConfigStatus.PENDING,  // ← Valeur par défaut
}
```

### Route POST /api/devices

La route de création ne spécifie **pas** le `configStatus`, donc il prend automatiquement la valeur par défaut :

```typescript
// app/api/devices/route.ts
const device = await Device.create({
  serialNumber: body.serialNumber,
  name: body.name,
  roomId: body.roomId,
  status: body.status || DeviceStatus.UNKNOWN,
  // configStatus: PENDING (défini automatiquement par le modèle)
  // ...
});
```

---

## 🧪 Test

### Créer un device

**Requête** :
```bash
curl -X POST http://localhost:3000/api/devices \
  -H "Content-Type: application/json" \
  -d '{
    "serialNumber": "ESP32-001",
    "name": "Capteur Salle 101",
    "roomId": "507f1f77bcf86cd799439031"
  }'
```

**Réponse** :
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "serialNumber": "ESP32-001",
    "name": "Capteur Salle 101",
    "roomId": "507f1f77bcf86cd799439031",
    "status": "UNKNOWN",
    "configStatus": "PENDING",  ⭐ Automatiquement défini à PENDING
    "isPoweredOn": true,
    "lastSeenAt": "2025-12-10T12:00:00.000Z",
    "createdAt": "2025-12-10T12:00:00.000Z"
  }
}
```

---

## 🔄 Cycle de vie du configStatus

### 1. Création du device (PENDING)

```bash
curl -X POST http://localhost:3000/api/devices \
  -H "Content-Type: application/json" \
  -d '{
    "serialNumber": "ESP32-001",
    "name": "Capteur Salle 101"
  }'
```

**Résultat** :
```json
{
  "configStatus": "PENDING"  ⭐ Automatique
}
```

---

### 2. Début de configuration (IN_PROGRESS)

L'admin scanne le badge NFC ou met à jour manuellement :

```bash
curl -X PATCH http://localhost:3000/api/devices/by-id/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "configStatus": "IN_PROGRESS"
  }'
```

Ou via NFC :

```bash
curl -X POST http://localhost:3000/api/admin/nfc/device-status \
  -H "Content-Type: application/json" \
  -d '{
    "badgeHash": "a1b2c3d4e5f6",
    "configStatus": "IN_PROGRESS"
  }'
```

---

### 3. Configuration terminée (CONFIGURED)

```bash
curl -X POST http://localhost:3000/api/admin/nfc/device-status \
  -H "Content-Type: application/json" \
  -d '{
    "badgeHash": "a1b2c3d4e5f6",
    "configStatus": "CONFIGURED"
  }'
```

---

## 📊 Enum DeviceConfigStatus

```typescript
export enum DeviceConfigStatus {
  PENDING = 'PENDING',           // ⭐ Valeur par défaut
  IN_PROGRESS = 'IN_PROGRESS',   // Config en cours
  CONFIGURED = 'CONFIGURED'       // Config terminée
}
```

---

## 🎯 Filtrer les devices par configStatus

### Devices en attente de config

```bash
curl "http://localhost:3000/api/devices?configStatus=PENDING"
```

**Utilisation** : Voir tous les devices qui doivent être configurés.

### Devices configurés

```bash
curl "http://localhost:3000/api/devices?configStatus=CONFIGURED"
```

**Utilisation** : Voir tous les devices prêts à l'emploi.

---

## 🔍 Vérifier le configStatus d'un device

### Par ID

```bash
curl http://localhost:3000/api/devices/by-id/507f1f77bcf86cd799439011
```

### Par Serial Number

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
    "configStatus": "PENDING"  ⭐ État actuel
  }
}
```

---

## 📱 Dashboard admin suggéré

### Liste des devices à configurer

```jsx
function PendingDevices() {
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    fetch('/api/devices?configStatus=PENDING')
      .then(r => r.json())
      .then(data => setDevices(data.data));
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">
        ⏳ Devices en attente de configuration ({devices.length})
      </h2>
      
      <div className="grid gap-4">
        {devices.map(device => (
          <div key={device._id} className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-bold">{device.serialNumber}</h3>
            <p className="text-gray-600">{device.name || 'Sans nom'}</p>
            
            <span className="inline-block mt-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded">
              ⏳ {device.configStatus}
            </span>
            
            <button 
              onClick={() => startConfiguration(device._id)}
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
            >
              Configurer
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## ✅ Récapitulatif

| Aspect | Valeur |
|--------|--------|
| **Valeur par défaut** | `PENDING` ⭐ |
| **Défini dans** | `models/Device.ts` (ligne 52) |
| **Route de création** | `POST /api/devices` |
| **Automatique** | ✅ Oui (ne nécessite pas de spécifier le champ) |
| **Modifiable** | ✅ Oui (via PATCH ou route NFC) |

---

## 🎉 Confirmé !

Le `configStatus` est **automatiquement défini à `PENDING`** lors de la création d'un device via `POST /api/devices`.

✅ Configuration dans le modèle  
✅ Valeur par défaut : `PENDING`  
✅ Pas besoin de spécifier dans la requête  
✅ Modifiable via PATCH ou NFC  
✅ Documenté dans Swagger  

🚀 **Fonctionne comme prévu !**

