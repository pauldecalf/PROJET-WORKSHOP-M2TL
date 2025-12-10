# Guide de Démarrage Rapide 🚀

Ce guide vous aidera à démarrer avec le projet en quelques minutes.

## Prérequis

- Node.js 18+ installé
- MongoDB installé localement OU compte MongoDB Atlas

## Étape 1 : Installation des dépendances

```bash
npm install
```

## Étape 2 : Configuration de MongoDB

### Option A : MongoDB Local (développement)

1. **Installer MongoDB** (si ce n'est pas déjà fait)

   **macOS :**
   ```bash
   brew tap mongodb/brew
   brew install mongodb-community
   brew services start mongodb-community
   ```

   **Linux (Ubuntu/Debian) :**
   ```bash
   sudo apt-get install mongodb
   sudo systemctl start mongodb
   ```

2. **Créer le fichier `.env.local`** à la racine du projet :
   ```env
   MONGODB_URI=mongodb://localhost:27017/workshop
   ```

### Option B : MongoDB Atlas (cloud - recommandé)

1. Créez un compte gratuit sur [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Créez un cluster gratuit (M0)
3. Créez un utilisateur de base de données
4. Autorisez votre IP (ou 0.0.0.0/0 pour le développement)
5. Obtenez votre URI de connexion
6. Créez `.env.local` :
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/workshop?retryWrites=true&w=majority
   ```

## Étape 3 : Initialiser la base de données (optionnel mais recommandé)

Ce script va créer des données de test (bâtiments, salles, devices, capteurs, mesures) :

```bash
npm run seed
```

**Ce que le script crée :**
- 2 utilisateurs (supervisor et student)
- 2 bâtiments
- 4 salles
- 4 devices IoT
- 12 capteurs (3 par device : température, humidité, CO2)
- ~17 000 mesures (24h de données par capteur)
- 4 statuts de salles

## Étape 4 : Lancer le serveur de développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Étape 5 : Tester les API Routes

### Avec votre navigateur

Ouvrez ces URLs directement :

- http://localhost:3000/api/devices
- http://localhost:3000/api/rooms/status
- http://localhost:3000/api/devices?status=ONLINE

### Avec cURL

```bash
# Liste des devices
curl http://localhost:3000/api/devices

# Statut des salles
curl http://localhost:3000/api/rooms/status

# Créer un nouveau device
curl -X POST http://localhost:3000/api/devices \
  -H "Content-Type: application/json" \
  -d '{
    "serialNumber": "ESP32-999",
    "name": "Mon nouveau capteur",
    "status": "ONLINE",
    "batteryLevel": 100
  }'

# Mesures d'un capteur (remplacez {sensorId} par un ID réel)
curl http://localhost:3000/api/sensors/{sensorId}/measurements?limit=10
```

### Avec Thunder Client (VS Code) ou Postman

1. Importez les routes depuis [API_ROUTES.md](./API_ROUTES.md)
2. Testez chaque endpoint

## 🎯 Prochaines étapes

Maintenant que tout fonctionne, vous pouvez :

1. **Explorer la base de données** avec MongoDB Compass :
   - Téléchargez [MongoDB Compass](https://www.mongodb.com/products/compass)
   - Connectez-vous avec votre URI MongoDB
   - Explorez les collections et les données

2. **Créer vos propres routes API** :
   - Consultez les exemples dans `app/api/`
   - Voir [API_ROUTES.md](./API_ROUTES.md) pour les patterns

3. **Ajouter des pages Next.js** :
   - Créez des composants dans `app/`
   - Utilisez les API routes pour récupérer les données

4. **Personnaliser les modèles** :
   - Modifiez les schémas dans `models/`
   - Ajoutez des champs ou validations

## 🐛 Dépannage

### Erreur : "Cannot connect to MongoDB"

- Vérifiez que MongoDB est démarré (local)
- Vérifiez que `MONGODB_URI` est correctement configuré dans `.env.local`
- Pour MongoDB Atlas, vérifiez que votre IP est autorisée

### Erreur : "EADDRINUSE" (port déjà utilisé)

Le port 3000 est déjà utilisé. Arrêtez l'autre processus ou changez le port :

```bash
PORT=3001 npm run dev
```

### Le script seed ne fonctionne pas

Assurez-vous que :
1. MongoDB est connecté
2. Le fichier `.env.local` existe et contient `MONGODB_URI`
3. Vous avez exécuté `npm install`

### Pas de données dans les API

Lancez le script seed :
```bash
npm run seed
```

## 📚 Documentation complète

- [README.md](./README.md) - Vue d'ensemble du projet
- [MONGODB_SETUP.md](./MONGODB_SETUP.md) - Configuration détaillée MongoDB
- [API_ROUTES.md](./API_ROUTES.md) - Documentation complète des API

## 🆘 Besoin d'aide ?

1. Vérifiez les logs du serveur (`npm run dev`)
2. Vérifiez les logs MongoDB
3. Consultez la documentation MongoDB Mongoose

## ✅ Checklist de démarrage

- [ ] MongoDB installé et démarré (ou compte Atlas créé)
- [ ] Dépendances installées (`npm install`)
- [ ] Fichier `.env.local` créé avec `MONGODB_URI`
- [ ] Base de données initialisée (`npm run seed`)
- [ ] Serveur de développement lancé (`npm run dev`)
- [ ] API testées dans le navigateur ou avec cURL

**Vous êtes prêt à développer ! 🎉**

