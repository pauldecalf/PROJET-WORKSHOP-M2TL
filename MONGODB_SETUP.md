# Configuration MongoDB

Ce projet utilise MongoDB comme base de données NoSQL avec Mongoose comme ODM (Object Document Mapper).

## 🚀 Installation

Les dépendances ont déjà été installées :
```bash
npm install mongoose
```

## 📁 Structure des fichiers

```
├── lib/
│   └── mongodb.ts          # Configuration de connexion MongoDB
├── models/                 # Modèles Mongoose
│   ├── Building.ts
│   ├── Room.ts
│   ├── User.ts
│   ├── Device.ts
│   ├── DeviceConfig.ts
│   ├── Sensor.ts
│   ├── SensorMeasurement.ts
│   ├── RoomStatus.ts
│   ├── NFCBadge.ts
│   ├── NFCEvent.ts
│   ├── DeviceCommand.ts
│   ├── OTAUpdate.ts
│   ├── AuditLog.ts
│   └── index.ts           # Export centralisé
└── types/
    ├── enums.ts           # Énumérations TypeScript
    └── global.d.ts        # Types globaux
```

## ⚙️ Configuration

### 1. Créer un fichier `.env.local`

Copiez les variables suivantes dans un fichier `.env.local` à la racine du projet :

```env
# Connexion locale
MONGODB_URI=mongodb://localhost:27017/workshop

# Ou MongoDB Atlas (cloud)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/workshop?retryWrites=true&w=majority
```

### 2. Installer MongoDB localement (optionnel)

Si vous souhaitez utiliser MongoDB en local :

**macOS (avec Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

**Windows:**
Téléchargez l'installateur depuis [mongodb.com/download-center/community](https://www.mongodb.com/try/download/community)

### 3. Utiliser MongoDB Atlas (cloud) - Recommandé

1. Créez un compte sur [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Créez un cluster gratuit
3. Configurez un utilisateur de base de données
4. Ajoutez votre IP à la liste blanche (ou autorisez 0.0.0.0/0 pour le développement)
5. Copiez l'URI de connexion dans votre `.env.local`

## 🔌 Utilisation dans Next.js

### Dans une API Route

```typescript
import connectDB from '@/lib/mongodb';
import { Device, Sensor } from '@/models';

export async function GET(request: Request) {
  try {
    // Connexion à MongoDB
    await connectDB();
    
    // Récupérer tous les devices
    const devices = await Device.find()
      .populate('roomId')
      .sort({ createdAt: -1 });
    
    return Response.json({ devices });
  } catch (error) {
    return Response.json(
      { error: 'Erreur lors de la récupération des données' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    
    const data = await request.json();
    const device = await Device.create(data);
    
    return Response.json({ device }, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: 'Erreur lors de la création' },
      { status: 500 }
    );
  }
}
```

### Dans un Server Component

```typescript
import connectDB from '@/lib/mongodb';
import { Building, Room } from '@/models';

export default async function BuildingsPage() {
  await connectDB();
  
  const buildings = await Building.find().lean();
  const rooms = await Room.find().populate('buildingId').lean();
  
  return (
    <div>
      <h1>Bâtiments</h1>
      {buildings.map(building => (
        <div key={building._id.toString()}>
          <h2>{building.name}</h2>
          <p>{building.address}</p>
        </div>
      ))}
    </div>
  );
}
```

## 📊 Collections créées

| Collection | Description |
|------------|-------------|
| `buildings` | Bâtiments |
| `rooms` | Salles de classe |
| `users` | Utilisateurs (SUPERVISOR, STUDENT) |
| `devices` | Boîtiers IoT |
| `deviceconfigs` | Historique de configuration des devices |
| `sensors` | Capteurs (température, humidité, CO2, etc.) |
| `sensormeasurements` | Mesures des capteurs (time-series) |
| `roomstatuses` | Statut temps réel des salles |
| `nfcbadges` | Badges NFC anonymisés |
| `nfcevents` | Événements de scan NFC |
| `devicecommands` | Commandes envoyées aux devices |
| `otaupdates` | Mises à jour OTA (Over-The-Air) |
| `auditlogs` | Journal d'audit des actions |

## 🔍 Exemples de requêtes

### Créer un bâtiment et des salles

```typescript
import { Building, Room } from '@/models';

const building = await Building.create({
  name: 'Bâtiment A',
  address: '123 Rue de l\'Innovation'
});

const room = await Room.create({
  buildingId: building._id,
  name: 'Salle 101',
  floor: 1,
  capacity: 30,
  mapX: 100,
  mapY: 200
});
```

### Créer un device avec des capteurs

```typescript
import { Device, Sensor } from '@/models';
import { DeviceStatus, SensorType } from '@/types/enums';

const device = await Device.create({
  serialNumber: 'ESP32-001',
  name: 'Capteur Salle 101',
  roomId: room._id,
  status: DeviceStatus.ONLINE,
  firmwareVersion: '1.0.0',
  batteryLevel: 95.5,
  isPoweredOn: true
});

const tempSensor = await Sensor.create({
  deviceId: device._id,
  type: SensorType.TEMPERATURE,
  label: 'Température ambiante',
  unit: '°C',
  minValue: -10,
  maxValue: 50
});
```

### Enregistrer des mesures

```typescript
import { SensorMeasurement } from '@/models';

await SensorMeasurement.create({
  sensorId: tempSensor._id,
  measuredAt: new Date(),
  numericValue: 22.5
});
```

### Récupérer les mesures d'un capteur sur une période

```typescript
const measurements = await SensorMeasurement.find({
  sensorId: tempSensor._id,
  measuredAt: {
    $gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Dernières 24h
    $lte: new Date()
  }
})
  .sort({ measuredAt: -1 })
  .limit(100);
```

### Mettre à jour le statut d'une salle

```typescript
import { RoomStatus } from '@/models';
import { RoomAvailability } from '@/types/enums';

await RoomStatus.findOneAndUpdate(
  { roomId: room._id },
  {
    availability: RoomAvailability.OCCUPIED,
    lastUpdateAt: new Date(),
    sourceDeviceId: device._id,
    reason: 'Détection NFC'
  },
  { upsert: true, new: true }
);
```

### Envoyer une commande à un device

```typescript
import { DeviceCommand } from '@/models';
import { CommandType, CommandStatus } from '@/types/enums';

const command = await DeviceCommand.create({
  deviceId: device._id,
  command: CommandType.SET_SAMPLING_INTERVAL,
  payload: { interval_sec: 60 },
  status: CommandStatus.PENDING,
  createdByUserId: user._id
});
```

## 🔐 Index et performances

Des index ont été créés automatiquement sur les champs fréquemment requêtés :
- `serialNumber` sur les devices (unique)
- `email` sur les users (unique)
- `sensorId + measuredAt` sur les mesures (time-series)
- `roomId` sur plusieurs collections

## 📝 Notes importantes

1. **Time-series pour les mesures** : La collection `sensormeasurements` est configurée comme une collection time-series MongoDB (nécessite MongoDB 5.0+)

2. **Relations** : Les relations sont gérées via des `ObjectId` références, similaires aux clés étrangères SQL

3. **Lean queries** : Utilisez `.lean()` dans les Server Components pour obtenir des objets JavaScript purs (sans méthodes Mongoose)

4. **Validation** : Les schémas Mongoose incluent des validations (required, min, max, enum, etc.)

## 🛠️ Outils utiles

### MongoDB Compass
Interface graphique pour explorer votre base de données :
[mongodb.com/products/compass](https://www.mongodb.com/products/compass)

### Mongoose documentation
[mongoosejs.com/docs/guide.html](https://mongoosejs.com/docs/guide.html)

## 🐛 Dépannage

### Erreur de connexion

Si vous obtenez une erreur de connexion :
1. Vérifiez que MongoDB est démarré
2. Vérifiez que `MONGODB_URI` est correctement défini dans `.env.local`
3. Pour MongoDB Atlas, vérifiez que votre IP est autorisée

### Erreur "buffering timed out"

Ajoutez `bufferCommands: false` dans les options de connexion (déjà fait dans `lib/mongodb.ts`)

