# 🔖 Badge ID et Config Status - Nouveaux champs

## ✅ Modifications appliquées

Deux nouveaux champs ont été ajoutés aux modèles **User** et **Device** :

1. **`badgeId`** : Référence vers un badge NFC
2. **`configStatus`** (Device uniquement) : Statut de configuration

---

## 📊 Modèle User (mis à jour)

### Interface TypeScript

```typescript
interface IUser {
  _id: string;
  email: string;
  passwordHash: string;
  role: 'SUPERVISOR' | 'STUDENT';
  displayName?: string;
  badgeId?: string;              // ⭐ NOUVEAU - Référence vers NFCBadge
  createdAt: Date;
  lastLoginAt?: Date;
}
```

### Exemple de document MongoDB

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "john.doe@example.com",
  "passwordHash": "$2a$10$...",
  "role": "STUDENT",
  "displayName": "John Doe",
  "badgeId": "507f1f77bcf86cd799439050",  // ⭐ NOUVEAU
  "createdAt": "2025-12-10T12:00:00.000Z"
}
```

### Utilisation

**Associer un badge à un utilisateur** :

```bash
curl -X PATCH http://localhost:3000/api/users/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "badgeId": "507f1f77bcf86cd799439050"
  }'
```

**Récupérer un utilisateur avec son badge** :

```javascript
const user = await User.findById(userId).populate('badgeId').lean();

console.log(user.badgeId); // { _id: "...", badgeHash: "...", ... }
```

---

## 📟 Modèle Device (mis à jour)

### Interface TypeScript

```typescript
interface IDevice {
  _id: string;
  serialNumber: string;
  name?: string;
  roomId?: string;
  badgeId?: string;              // ⭐ NOUVEAU - Référence vers NFCBadge
  status: 'ONLINE' | 'OFFLINE' | 'ERROR' | 'UNKNOWN';
  configStatus: 'PENDING' | 'IN_PROGRESS' | 'CONFIGURED';  // ⭐ NOUVEAU
  firmwareVersion?: string;
  batteryLevel?: number;
  isPoweredOn: boolean;
  lastSeenAt?: Date;
  createdAt: Date;
}
```

### Exemple de document MongoDB

```json
{
  "_id": "507f1f77bcf86cd799439021",
  "serialNumber": "ESP32-001",
  "name": "Capteur Salle 101",
  "roomId": "507f1f77bcf86cd799439031",
  "badgeId": "507f1f77bcf86cd799439050",        // ⭐ NOUVEAU
  "status": "ONLINE",
  "configStatus": "CONFIGURED",                  // ⭐ NOUVEAU
  "firmwareVersion": "1.0.0",
  "batteryLevel": 95.5,
  "isPoweredOn": true,
  "lastSeenAt": "2025-12-10T12:30:00.000Z",
  "createdAt": "2025-12-10T12:00:00.000Z"
}
```

---

## 🎯 Enum DeviceConfigStatus

### Valeurs possibles

```typescript
export enum DeviceConfigStatus {
  PENDING = 'PENDING',           // En attente de config
  IN_PROGRESS = 'IN_PROGRESS',   // Config en cours
  CONFIGURED = 'CONFIGURED'       // Configuré
}
```

### Signification

| Statut | Description | Utilisation |
|--------|-------------|-------------|
| `PENDING` | Device créé mais pas encore configuré | Valeur par défaut à la création |
| `IN_PROGRESS` | Configuration en cours | Pendant l'envoi de la config |
| `CONFIGURED` | Device complètement configuré | Config terminée avec succès |

---

## 🔄 Workflow de configuration d'un device

### 1. Création du device (statut PENDING)

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
    "_id": "507f1f77bcf86cd799439021",
    "serialNumber": "ESP32-001",
    "status": "UNKNOWN",
    "configStatus": "PENDING"  // ⭐ Par défaut
  }
}
```

---

### 2. Démarrage de la configuration (IN_PROGRESS)

```bash
curl -X PATCH http://localhost:3000/api/devices/507f1f77bcf86cd799439021 \
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
    "_id": "507f1f77bcf86cd799439021",
    "configStatus": "IN_PROGRESS"  // ⭐ Mis à jour
  }
}
```

---

### 3. Configuration terminée (CONFIGURED)

```bash
curl -X PATCH http://localhost:3000/api/devices/507f1f77bcf86cd799439021 \
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
    "_id": "507f1f77bcf86cd799439021",
    "status": "ONLINE",
    "configStatus": "CONFIGURED"  // ⭐ Configuration terminée
  }
}
```

---

## 🔖 Association Badge ↔ Device

### Cas d'usage

Un **badge NFC** peut être associé à un **device** pour :
- Identifier quel device a détecté un badge
- Lier un lecteur NFC à un badge spécifique
- Tracer les événements NFC

### Exemple : Associer un badge à un device

```bash
curl -X PATCH http://localhost:3000/api/devices/507f1f77bcf86cd799439021 \
  -H "Content-Type: application/json" \
  -d '{
    "badgeId": "507f1f77bcf86cd799439050"
  }'
```

### Récupérer un device avec son badge

```javascript
const device = await Device.findById(deviceId)
  .populate('badgeId')
  .populate('roomId')
  .lean();

console.log(device.badgeId); // { _id: "...", badgeHash: "...", ... }
```

---

## 📊 Statistiques par configStatus

### Récupérer les devices par statut de config

```javascript
// Devices en attente de config
const pendingDevices = await Device.find({ configStatus: 'PENDING' });

// Devices en cours de config
const inProgressDevices = await Device.find({ configStatus: 'IN_PROGRESS' });

// Devices configurés
const configuredDevices = await Device.find({ configStatus: 'CONFIGURED' });
```

### Exemple de dashboard admin

```bash
curl http://localhost:3000/api/admin/devices/stats
```

**Réponse enrichie** :
```json
{
  "success": true,
  "data": {
    "devices": {
      "total": 10,
      "byStatus": {
        "ONLINE": 7,
        "OFFLINE": 2,
        "UNKNOWN": 1
      },
      "byConfigStatus": {          // ⭐ NOUVEAU
        "PENDING": 2,
        "IN_PROGRESS": 1,
        "CONFIGURED": 7
      }
    }
  }
}
```

---

## 🎨 Interface utilisateur suggérée

### Badge de statut de config

```jsx
function ConfigStatusBadge({ status }) {
  const styles = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    CONFIGURED: 'bg-green-100 text-green-800'
  };

  const labels = {
    PENDING: '⏳ En attente',
    IN_PROGRESS: '⚙️ Configuration en cours',
    CONFIGURED: '✅ Configuré'
  };

  return (
    <span className={`px-2 py-1 rounded ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
```

### Affichage dans une liste

```jsx
<table>
  <thead>
    <tr>
      <th>Serial Number</th>
      <th>Statut</th>
      <th>Config</th>
      <th>Badge</th>
    </tr>
  </thead>
  <tbody>
    {devices.map(device => (
      <tr key={device._id}>
        <td>{device.serialNumber}</td>
        <td><StatusBadge status={device.status} /></td>
        <td><ConfigStatusBadge status={device.configStatus} /></td>
        <td>{device.badgeId ? '🔖 Associé' : '-'}</td>
      </tr>
    ))}
  </tbody>
</table>
```

---

## 🔍 Filtrage et recherche

### Filtrer les devices par configStatus

```bash
# Devices en attente de config
curl "http://localhost:3000/api/devices?configStatus=PENDING"

# Devices configurés
curl "http://localhost:3000/api/devices?configStatus=CONFIGURED"
```

### Filtrer les users avec badge

```bash
# Users ayant un badge associé
curl "http://localhost:3000/api/users?hasBadge=true"
```

---

## 📝 Validation

### Device

- ✅ `configStatus` : Requis, valeurs : `PENDING`, `IN_PROGRESS`, `CONFIGURED`
- ✅ `badgeId` : Optionnel, référence vers `NFCBadge`
- ✅ Valeur par défaut : `PENDING`

### User

- ✅ `badgeId` : Optionnel, référence vers `NFCBadge`
- ✅ Pas de valeur par défaut

---

## 🔗 Relations

### User ↔ NFCBadge (1:1)

```
User (1)
  ↓ badgeId
NFCBadge (1)
```

Un utilisateur peut avoir **un seul badge**.

### Device ↔ NFCBadge (1:1)

```
Device (1)
  ↓ badgeId
NFCBadge (1)
```

Un device peut être associé à **un seul badge** (par exemple, un lecteur NFC dédié).

---

## 📚 Documentation Swagger

Les schémas Swagger ont été mis à jour :

### Schema Device

```yaml
Device:
  properties:
    badgeId:
      type: string
      description: ID du badge NFC associé
      example: "507f1f77bcf86cd799439050"
    configStatus:
      type: string
      enum: [PENDING, IN_PROGRESS, CONFIGURED]
      description: Statut de configuration du device
      example: CONFIGURED
```

---

## ✅ Build réussi

```bash
✓ Compiled successfully
✓ Running TypeScript
✓ 32 routes API
✓ Nouveaux champs : badgeId, configStatus
```

---

## 🚀 Déploiement

```bash
git add .
git commit -m "feat: Add badgeId to User/Device and configStatus to Device"
git push
```

---

## 📊 Récapitulatif

| Modèle | Champ ajouté | Type | Description |
|--------|--------------|------|-------------|
| **User** | `badgeId` | ObjectId (optionnel) | Référence vers NFCBadge |
| **Device** | `badgeId` | ObjectId (optionnel) | Référence vers NFCBadge |
| **Device** | `configStatus` | Enum (requis) | PENDING, IN_PROGRESS, CONFIGURED |

### Enum créé

```typescript
export enum DeviceConfigStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  CONFIGURED = 'CONFIGURED'
}
```

---

## 🎉 Terminé !

Les nouveaux champs sont maintenant disponibles dans votre API ! ✅

- ✅ `User.badgeId`
- ✅ `Device.badgeId`
- ✅ `Device.configStatus`
- ✅ Enum `DeviceConfigStatus`
- ✅ Documentation Swagger mise à jour
- ✅ Build TypeScript sans erreur

🚀 **Prêt pour le déploiement !**

