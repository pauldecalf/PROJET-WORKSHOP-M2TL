# Projet Workshop - Système IoT de Gestion de Salles

Application Next.js avec MongoDB pour la gestion de dispositifs IoT, capteurs et salles de classe.

## 🚀 Démarrage rapide

**Nouveau sur le projet ? Consultez le [Guide de démarrage rapide (QUICKSTART.md)](./QUICKSTART.md) !**

### Installation en 3 étapes

```bash
# 1. Installer les dépendances
npm install

# 2. Créer .env.local avec votre URI MongoDB
echo "MONGODB_URI=mongodb://localhost:27017/workshop" > .env.local

# 3. Initialiser la base de données avec des données de test
npm run seed
```

### Lancer le serveur

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📁 Structure du projet

```
├── app/
│   ├── api/              # Routes API REST
│   │   ├── devices/      # Gestion des devices IoT
│   │   ├── rooms/        # Gestion des salles
│   │   └── sensors/      # Gestion des capteurs et mesures
│   └── page.tsx          # Page d'accueil
├── lib/
│   └── mongodb.ts        # Configuration MongoDB
├── models/               # Modèles Mongoose (13 collections)
│   ├── Building.ts
│   ├── Room.ts
│   ├── Device.ts
│   ├── Sensor.ts
│   ├── SensorMeasurement.ts
│   └── ...
└── types/
    └── enums.ts          # Énumérations TypeScript
```

## 🔌 API Routes

Consultez [API_ROUTES.md](./API_ROUTES.md) pour la documentation complète des endpoints.

**Exemples de routes disponibles :**
- `GET /api/devices` - Liste des devices IoT
- `POST /api/devices` - Créer un device
- `GET /api/rooms/status` - Statut des salles en temps réel
- `GET /api/sensors/[id]/measurements` - Mesures d'un capteur

## 🗄️ Base de données

Le projet utilise **MongoDB** avec **Mongoose** comme ODM.

**Collections principales :**
- `buildings` - Bâtiments
- `rooms` - Salles de classe
- `devices` - Boîtiers IoT
- `sensors` - Capteurs (température, humidité, CO2, etc.)
- `sensormeasurements` - Mesures time-series
- `roomstatuses` - Statut temps réel des salles
- `nfcevents` - Événements NFC anonymisés
- `devicecommands` - Commandes envoyées aux devices
- `otaupdates` - Mises à jour OTA

Voir [MONGODB_SETUP.md](./MONGODB_SETUP.md) pour plus de détails.

## 🛠️ Technologies utilisées

- **Next.js 16** - Framework React
- **TypeScript** - Typage statique
- **MongoDB** - Base de données NoSQL
- **Mongoose 9** - ODM pour MongoDB
- **Tailwind CSS** - Framework CSS

## 📚 Documentation

- **[Swagger UI](http://localhost:3000/api-docs)** - Documentation API interactive 🎯
- [Configuration MongoDB](./MONGODB_SETUP.md)
- [Routes API](./API_ROUTES.md)
- [Documentation Swagger](./SWAGGER_DOCUMENTATION.md)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
