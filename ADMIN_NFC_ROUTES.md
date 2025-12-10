# 🔖 Routes Admin NFC - Documentation

## ✅ 3 nouvelles routes créées

Routes admin pour gérer les devices via NFC :

1. **POST** `/api/admin/nfc/device-status` - Changer le statut d'un device via NFC
2. **POST** `/api/admin/nfc/scan` - Scanner un badge NFC
3. **POST** `/api/admin/nfc/associate` - Associer un badge à un device

---

## 📊 Total des routes API

**35 routes** au total :

- 🔐 Auth : 3 routes
- 📟 Devices : 5 routes
- 🤖 IoT Devices : 2 routes
- 🎛️ Device Commands : 3 routes
- 🏢 Buildings : 6 routes
- 🏠 Rooms : 6 routes
- 📊 Measurements : 3 routes
- 🌐 Public : 2 routes
- 🔧 Admin : 5 routes (2 + **3 nouvelles** ⭐)

---

## 🔖 Route 1 : Changer le statut d'un device via NFC

### POST `/api/admin/nfc/device-status`

Permet à un admin de scanner un badge NFC pour changer le statut de configuration d'un device.

### Requête

```bash
curl -X POST http://localhost:3000/api/admin/nfc/device-status \
  -H "Content-Type: application/json" \
  -d '{
    "badgeHash": "a1b2c3d4e5f6",
    "configStatus": "CONFIGURED"
  }'
```

### Paramètres

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `badgeHash` | string | ✅ | Hash du badge NFC scanné |
| `configStatus` | enum | ✅ | Nouveau statut : `PENDING`, `IN_PROGRESS`, `CONFIGURED` |

### Réponse (200 OK)

```json
{
  "success": true,
  "message": "Statut du device mis à jour avec succès",
  "badge": {
    "badgeId": "507f1f77bcf86cd799439050",
    "badgeHash": "a1b2c3d4e5f6"
  },
  "device": {
    "_id": "507f1f77bcf86cd799439021",
    "serialNumber": "ESP32-001",
    "name": "Capteur Salle 101",
    "configStatus": "CONFIGURED",
    "previousStatus": "IN_PROGRESS"
  }
}
```

### Erreurs possibles

**400 Bad Request** :
```json
{
  "success": false,
  "error": "badgeHash et configStatus sont requis"
}
```

**404 Not Found** :
```json
{
  "success": false,
  "error": "Badge NFC non trouvé"
}
```

```json
{
  "success": false,
  "error": "Aucun device associé à ce badge"
}
```

---

## 🔍 Route 2 : Scanner un badge NFC

### POST `/api/admin/nfc/scan`

Permet à un admin de scanner un badge NFC pour récupérer toutes les informations associées (device et/ou user).

### Requête

```bash
curl -X POST http://localhost:3000/api/admin/nfc/scan \
  -H "Content-Type: application/json" \
  -d '{
    "badgeHash": "a1b2c3d4e5f6"
  }'
```

### Paramètres

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `badgeHash` | string | ✅ | Hash du badge NFC scanné |

### Réponse (200 OK)

```json
{
  "success": true,
  "badge": {
    "_id": "507f1f77bcf86cd799439050",
    "badgeHash": "a1b2c3d4e5f6",
    "createdAt": "2025-12-10T12:00:00.000Z"
  },
  "device": {
    "_id": "507f1f77bcf86cd799439021",
    "serialNumber": "ESP32-001",
    "name": "Capteur Salle 101",
    "roomId": {
      "_id": "507f1f77bcf86cd799439031",
      "name": "Salle 101"
    },
    "status": "ONLINE",
    "configStatus": "CONFIGURED",
    "batteryLevel": 95.5,
    "lastSeenAt": "2025-12-10T12:30:00.000Z"
  },
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "john.doe@example.com",
    "displayName": "John Doe",
    "role": "STUDENT"
  }
}
```

**Si aucun device/user associé** :
```json
{
  "success": true,
  "badge": { ... },
  "device": null,
  "user": null
}
```

### Cas d'usage

1. **Vérifier l'association d'un badge** : Voir quel device/user est lié
2. **Diagnostic** : Vérifier l'état d'un device en scannant son badge
3. **Audit** : Tracer qui a scanné quel badge

---

## 🔗 Route 3 : Associer un badge à un device

### POST `/api/admin/nfc/associate`

Permet à un admin d'associer un badge NFC à un device.

### Requête

```bash
curl -X POST http://localhost:3000/api/admin/nfc/associate \
  -H "Content-Type: application/json" \
  -d '{
    "badgeHash": "a1b2c3d4e5f6",
    "deviceId": "507f1f77bcf86cd799439021"
  }'
```

### Paramètres

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `badgeHash` | string | ✅ | Hash du badge NFC scanné |
| `deviceId` | string | ✅ | ID du device à associer |

### Réponse (200 OK)

```json
{
  "success": true,
  "message": "Badge associé au device avec succès",
  "badge": {
    "_id": "507f1f77bcf86cd799439050",
    "badgeHash": "a1b2c3d4e5f6"
  },
  "device": {
    "_id": "507f1f77bcf86cd799439021",
    "serialNumber": "ESP32-001",
    "name": "Capteur Salle 101",
    "badgeId": "507f1f77bcf86cd799439050"
  }
}
```

### Erreurs possibles

**400 Bad Request** (badge déjà associé) :
```json
{
  "success": false,
  "error": "Ce badge est déjà associé au device ESP32-002"
}
```

**404 Not Found** :
```json
{
  "success": false,
  "error": "Badge NFC non trouvé"
}
```

---

## 🎯 Workflow complet

### Scénario : Configuration d'un nouveau device

#### 1. Créer le device

```bash
curl -X POST http://localhost:3000/api/devices \
  -H "Content-Type: application/json" \
  -d '{
    "serialNumber": "ESP32-001",
    "name": "Capteur Salle 101",
    "roomId": "507f1f77bcf86cd799439031"
  }'
```

**Réponse** : Device créé avec `configStatus: "PENDING"`

---

#### 2. Scanner un badge NFC

```bash
curl -X POST http://localhost:3000/api/admin/nfc/scan \
  -H "Content-Type: application/json" \
  -d '{
    "badgeHash": "a1b2c3d4e5f6"
  }'
```

**Réponse** : Informations du badge (vérifier qu'il n'est pas déjà associé)

---

#### 3. Associer le badge au device

```bash
curl -X POST http://localhost:3000/api/admin/nfc/associate \
  -H "Content-Type: application/json" \
  -d '{
    "badgeHash": "a1b2c3d4e5f6",
    "deviceId": "507f1f77bcf86cd799439021"
  }'
```

**Réponse** : Badge associé au device

---

#### 4. Démarrer la configuration

```bash
curl -X POST http://localhost:3000/api/admin/nfc/device-status \
  -H "Content-Type: application/json" \
  -d '{
    "badgeHash": "a1b2c3d4e5f6",
    "configStatus": "IN_PROGRESS"
  }'
```

**Réponse** : `configStatus` mis à jour à `IN_PROGRESS`

---

#### 5. Terminer la configuration

```bash
curl -X POST http://localhost:3000/api/admin/nfc/device-status \
  -H "Content-Type: application/json" \
  -d '{
    "badgeHash": "a1b2c3d4e5f6",
    "configStatus": "CONFIGURED"
  }'
```

**Réponse** : `configStatus` mis à jour à `CONFIGURED`

---

## 📱 Interface mobile suggérée

### Écran de scan NFC

```jsx
import { useState } from 'react';

function NFCScanScreen() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);

  const handleScan = async (badgeHash) => {
    setScanning(true);
    
    try {
      const response = await fetch('/api/admin/nfc/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ badgeHash }),
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Erreur scan:', error);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">🔖 Scanner un badge NFC</h1>
      
      {scanning ? (
        <div className="text-center">
          <p>📡 Scan en cours...</p>
        </div>
      ) : result ? (
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-bold mb-2">Badge scanné</h2>
          <p>Hash: {result.badge.badgeHash}</p>
          
          {result.device && (
            <div className="mt-4">
              <h3 className="font-bold">Device associé</h3>
              <p>Serial: {result.device.serialNumber}</p>
              <p>Statut: {result.device.configStatus}</p>
            </div>
          )}
          
          <button 
            onClick={() => handleChangeStatus(result.badge.badgeHash)}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Changer le statut
          </button>
        </div>
      ) : (
        <button 
          onClick={() => handleScan('a1b2c3d4e5f6')}
          className="bg-green-500 text-white px-6 py-3 rounded-lg"
        >
          📡 Démarrer le scan
        </button>
      )}
    </div>
  );
}
```

### Écran de changement de statut

```jsx
function ChangeStatusScreen({ badgeHash, currentStatus }) {
  const [newStatus, setNewStatus] = useState(currentStatus);

  const handleSubmit = async () => {
    const response = await fetch('/api/admin/nfc/device-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ badgeHash, configStatus: newStatus }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert('✅ Statut mis à jour !');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Changer le statut</h2>
      
      <select 
        value={newStatus} 
        onChange={(e) => setNewStatus(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      >
        <option value="PENDING">⏳ En attente</option>
        <option value="IN_PROGRESS">⚙️ Configuration en cours</option>
        <option value="CONFIGURED">✅ Configuré</option>
      </select>
      
      <button 
        onClick={handleSubmit}
        className="w-full bg-blue-500 text-white py-3 rounded-lg"
      >
        Confirmer
      </button>
    </div>
  );
}
```

---

## 🔒 Sécurité

### Authentification requise

Ces routes sont réservées aux **administrateurs** (role: `SUPERVISOR`).

**Middleware recommandé** :

```typescript
import { requireAuth, requireRole } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const payload = await requireAuth(request);
    
    // Vérifier le rôle admin
    requireRole(payload, ['SUPERVISOR']);
    
    // ... logique de la route
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Accès refusé' },
      { status: 403 }
    );
  }
}
```

---

## 📚 Documentation Swagger

Les 3 routes sont documentées dans Swagger UI :

1. Accédez à : http://localhost:3000/api-docs
2. Cherchez les tags **"Admin"** et **"NFC"**
3. Testez les routes directement depuis l'interface

---

## 🎯 Cas d'usage réels

### 1. Configuration initiale d'un device

Un technicien installe un nouveau capteur :
1. Scanne le badge NFC du device
2. Associe le badge au device dans le système
3. Change le statut à `IN_PROGRESS`
4. Configure le device (WiFi, MQTT, etc.)
5. Change le statut à `CONFIGURED`

### 2. Maintenance d'un device

Un technicien intervient sur un device :
1. Scanne le badge pour identifier le device
2. Vérifie l'état actuel (batterie, dernière connexion)
3. Effectue la maintenance
4. Change le statut si nécessaire

### 3. Audit et traçabilité

Un superviseur vérifie l'état du parc :
1. Scanne plusieurs badges
2. Vérifie les statuts de configuration
3. Identifie les devices en attente de config

---

## 📊 Statistiques enrichies

Ajoutez les stats de configuration dans `/api/admin/devices/stats` :

```json
{
  "devices": {
    "total": 10,
    "byConfigStatus": {
      "PENDING": 2,
      "IN_PROGRESS": 1,
      "CONFIGURED": 7
    }
  }
}
```

---

## ✅ Récapitulatif

| Route | Méthode | Description |
|-------|---------|-------------|
| `/api/admin/nfc/device-status` | POST | Changer le statut d'un device via NFC |
| `/api/admin/nfc/scan` | POST | Scanner un badge et récupérer les infos |
| `/api/admin/nfc/associate` | POST | Associer un badge à un device |

**Total : 35 routes API** ✅

---

## 🚀 Déploiement

```bash
git add .
git commit -m "feat: Add admin NFC routes for device status management"
git push
```

Railway déploiera automatiquement les nouvelles routes ! 🎉

