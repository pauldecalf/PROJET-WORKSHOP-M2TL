# ✅ Installation MongoDB - Terminée !

## 🎉 Ce qui a été mis en place

Votre projet Next.js est maintenant **complètement configuré** avec MongoDB !

### 📦 Dépendances installées

- ✅ `mongoose@9.0.1` - ODM pour MongoDB
- ✅ `tsx` - Exécution de scripts TypeScript

### 📁 Fichiers créés

#### Configuration MongoDB
- ✅ `lib/mongodb.ts` - Connexion MongoDB avec cache pour Next.js

#### Types TypeScript (2 fichiers)
- ✅ `types/enums.ts` - 7 énumérations (UserRole, DeviceStatus, etc.)
- ✅ `types/global.d.ts` - Types globaux pour Mongoose

#### Modèles Mongoose (14 fichiers)
- ✅ `models/Building.ts` - Bâtiments
- ✅ `models/Room.ts` - Salles
- ✅ `models/User.ts` - Utilisateurs
- ✅ `models/Device.ts` - Devices IoT
- ✅ `models/DeviceConfig.ts` - Configurations des devices
- ✅ `models/Sensor.ts` - Capteurs
- ✅ `models/SensorMeasurement.ts` - Mesures time-series
- ✅ `models/RoomStatus.ts` - Statut des salles
- ✅ `models/NFCBadge.ts` - Badges NFC
- ✅ `models/NFCEvent.ts` - Événements NFC
- ✅ `models/DeviceCommand.ts` - Commandes
- ✅ `models/OTAUpdate.ts` - Mises à jour OTA
- ✅ `models/AuditLog.ts` - Logs d'audit
- ✅ `models/index.ts` - Export centralisé

#### Routes API (4 fichiers)
- ✅ `app/api/devices/route.ts` - GET, POST /api/devices
- ✅ `app/api/devices/[id]/route.ts` - GET, PATCH, DELETE
- ✅ `app/api/rooms/status/route.ts` - Statut des salles
- ✅ `app/api/sensors/[sensorId]/measurements/route.ts` - Mesures

#### Scripts utilitaires
- ✅ `scripts/seed-database.ts` - Initialisation de la BDD avec données de test

#### Documentation (5 fichiers)
- ✅ `README.md` - Documentation principale (mise à jour)
- ✅ `QUICKSTART.md` - Guide de démarrage rapide
- ✅ `MONGODB_SETUP.md` - Configuration MongoDB détaillée
- ✅ `API_ROUTES.md` - Documentation des API
- ✅ `ARCHITECTURE.md` - Architecture du projet

#### Configuration
- ✅ `.gitignore` - Mis à jour pour exclure .env.local
- ✅ `package.json` - Ajout du script `npm run seed`

---

## 🚀 Comment démarrer maintenant ?

### Option 1 : Démarrage rapide (5 minutes)

```bash
# 1. Créer le fichier de configuration
echo "MONGODB_URI=mongodb://localhost:27017/workshop" > .env.local

# 2. Initialiser la base de données avec des données de test
npm run seed

# 3. Lancer le serveur
npm run dev
```

**📌 Note :** Cette option nécessite MongoDB installé localement.

### Option 2 : Avec MongoDB Atlas (cloud - recommandé)

```bash
# 1. Créer un compte sur https://mongodb.com/cloud/atlas
# 2. Créer un cluster gratuit
# 3. Obtenir l'URI de connexion
# 4. Créer .env.local avec votre URI
echo "MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/workshop" > .env.local

# 5. Initialiser la base de données
npm run seed

# 6. Lancer le serveur
npm run dev
```

---

## 🧪 Tester que tout fonctionne

### 1. Démarrer le serveur
```bash
npm run dev
```

### 2. Tester les API dans votre navigateur

Ouvrez ces URLs :
- http://localhost:3000/api/devices
- http://localhost:3000/api/rooms/status

Vous devriez voir des données JSON si vous avez lancé `npm run seed`.

### 3. Tester avec cURL

```bash
# Liste des devices
curl http://localhost:3000/api/devices

# Créer un nouveau device
curl -X POST http://localhost:3000/api/devices \
  -H "Content-Type: application/json" \
  -d '{"serialNumber":"TEST-001","name":"Test Device"}'
```

---

## 📊 Structure de la base de données

**13 collections MongoDB créées :**

| Collection | Description | Relations |
|------------|-------------|-----------|
| `buildings` | Bâtiments | → rooms |
| `rooms` | Salles | ← buildings, → devices |
| `roomstatuses` | Statut temps réel | ← rooms |
| `users` | Utilisateurs | SUPERVISOR/STUDENT |
| `devices` | Boîtiers IoT | ← rooms, → sensors |
| `deviceconfigs` | Configurations | ← devices |
| `devicecommands` | Commandes | ← devices |
| `otaupdates` | Mises à jour OTA | ← devices |
| `sensors` | Capteurs | ← devices |
| `sensormeasurements` | Mesures | ← sensors |
| `nfcbadges` | Badges NFC | → nfcevents |
| `nfcevents` | Scans NFC | ← sensors, badges |
| `auditlogs` | Journal d'audit | Global |

---

## 📚 Documentation disponible

| Fichier | Description |
|---------|-------------|
| **[QUICKSTART.md](./QUICKSTART.md)** | ⚡ Démarrage en 5 minutes |
| **[MONGODB_SETUP.md](./MONGODB_SETUP.md)** | 🗄️ Configuration MongoDB + exemples |
| **[API_ROUTES.md](./API_ROUTES.md)** | 🔌 Documentation des API + exemples cURL |
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | 🏗️ Architecture complète du projet |
| **[README.md](./README.md)** | 📖 Vue d'ensemble |

---

## 🎯 Prochaines étapes recommandées

### 1. Explorer la base de données

**Avec MongoDB Compass (GUI) :**
- Téléchargez [MongoDB Compass](https://www.mongodb.com/products/compass)
- Connectez-vous avec votre `MONGODB_URI`
- Explorez les collections et documents

**Avec la ligne de commande :**
```bash
# Se connecter à MongoDB
mongosh mongodb://localhost:27017/workshop

# Lister les collections
show collections

# Voir les devices
db.devices.find().pretty()

# Compter les mesures
db.sensormeasurements.countDocuments()
```

### 2. Créer vos premières pages Next.js

```typescript
// app/devices/page.tsx
import connectDB from '@/lib/mongodb';
import { Device } from '@/models';

export default async function DevicesPage() {
  await connectDB();
  const devices = await Device.find().populate('roomId').lean();
  
  return (
    <div>
      <h1>Mes Devices IoT</h1>
      <ul>
        {devices.map(device => (
          <li key={device._id.toString()}>
            {device.name} - {device.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 3. Ajouter l'authentification

Consultez [NextAuth.js](https://next-auth.js.org/) pour sécuriser vos routes.

### 4. Créer un dashboard temps réel

Utilisez les API routes avec polling ou WebSocket pour afficher les données en temps réel.

---

## 🛠️ Scripts npm disponibles

```bash
npm run dev        # Lancer le serveur de développement
npm run build      # Build pour la production
npm start          # Lancer en production
npm run lint       # Vérifier le code
npm run seed       # Initialiser la base de données
```

---

## 🐛 Aide au dépannage

### ❌ Erreur : "Cannot connect to MongoDB"

**Solution :**
1. Vérifiez que MongoDB est démarré (si local)
   ```bash
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongodb
   ```
2. Vérifiez que `.env.local` existe et contient `MONGODB_URI`
3. Pour MongoDB Atlas, vérifiez que votre IP est autorisée

### ❌ Erreur : "Module not found: Can't resolve '@/lib/mongodb'"

**Solution :**
```bash
# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
```

### ❌ Le script seed ne crée pas de données

**Solution :**
1. Vérifiez que MongoDB est connecté
2. Vérifiez les logs du script :
   ```bash
   npm run seed
   ```
3. Supprimez les anciennes données :
   ```bash
   # MongoDB CLI
   mongosh mongodb://localhost:27017/workshop
   db.dropDatabase()
   ```

### ❌ Port 3000 déjà utilisé

**Solution :**
```bash
# Utiliser un autre port
PORT=3001 npm run dev
```

---

## 📈 Données de test créées par `npm run seed`

Lorsque vous lancez `npm run seed`, voici ce qui est créé :

- **2 utilisateurs**
  - supervisor@example.com (SUPERVISOR)
  - student@example.com (STUDENT)

- **2 bâtiments**
  - Bâtiment A
  - Bâtiment B

- **4 salles**
  - Salle 101, 102, 201 (Bâtiment A)
  - Laboratoire 301 (Bâtiment B)

- **4 devices IoT**
  - ESP32-001, ESP32-002, ESP32-003, ESP32-004
  - Avec différents statuts (ONLINE, OFFLINE)

- **12 capteurs**
  - 3 capteurs par device :
    - Température (°C)
    - Humidité (%)
    - CO2 (ppm)

- **~17 000 mesures**
  - 24h de données historiques
  - 1 mesure toutes les 10 minutes par capteur

- **4 statuts de salles**
  - Avec différentes disponibilités (AVAILABLE, OCCUPIED, UNKNOWN)

**Total : ~17 000+ documents créés !**

---

## ✅ Checklist finale

- [x] MongoDB configuré
- [x] Mongoose installé
- [x] 13 modèles créés
- [x] 4 routes API créées
- [x] Script de seed créé
- [x] Documentation complète
- [x] .gitignore mis à jour
- [x] Types TypeScript définis
- [x] Aucune erreur de linting

---

## 🎓 Ressources d'apprentissage

- [Documentation Mongoose](https://mongoosejs.com/docs/guide.html)
- [Documentation MongoDB](https://www.mongodb.com/docs/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 💡 Conseils

1. **Sauvegardez vos données** : Exportez régulièrement avec `mongodump`
2. **Utilisez des index** : Déjà configurés dans les modèles
3. **Validez les données** : Les schémas Mongoose incluent des validations
4. **Sécurisez l'API** : Ajoutez l'authentification pour la production
5. **Testez** : Écrivez des tests unitaires et d'intégration

---

## 🤝 Support

Si vous avez des questions :
1. Consultez la documentation dans les fichiers `.md`
2. Vérifiez les logs du serveur (`npm run dev`)
3. Vérifiez les logs MongoDB

---

**🎉 Félicitations ! Votre projet MongoDB est prêt à l'emploi !**

Commencez par : **[QUICKSTART.md](./QUICKSTART.md)**

