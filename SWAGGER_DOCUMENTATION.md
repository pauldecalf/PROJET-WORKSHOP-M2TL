# 📚 Documentation Swagger API

Votre projet dispose maintenant d'une documentation API interactive complète avec **Swagger UI** !

## 🚀 Accéder à la documentation

### En développement

1. **Démarrer le serveur** :
   ```bash
   npm run dev
   ```

2. **Ouvrir Swagger UI dans votre navigateur** :
   ```
   http://localhost:3000/api-docs
   ```

### En production

Remplacez `localhost:3000` par votre domaine :
```
https://votre-domaine.com/api-docs
```

---

## 🎯 Fonctionnalités Swagger UI

### 📖 Explorer les routes

- **Vue d'ensemble** : Toutes les routes API sont listées par catégories (tags)
- **Détails complets** : Paramètres, body, réponses, exemples
- **Schémas** : Modèles de données (Device, Room, Sensor, etc.)

### 🧪 Tester les API directement

1. Cliquez sur une route (ex: `GET /api/devices`)
2. Cliquez sur **"Try it out"**
3. Remplissez les paramètres (optionnel)
4. Cliquez sur **"Execute"**
5. Visualisez la réponse en temps réel

### 📋 Copier les requêtes

Swagger UI génère automatiquement :
- Commandes cURL
- URL complètes
- Corps de requête (JSON)

---

## 📊 Routes documentées

### Devices (5 endpoints)
- `GET /api/devices` - Liste des devices
- `POST /api/devices` - Créer un device
- `GET /api/devices/{id}` - Détails d'un device
- `PATCH /api/devices/{id}` - Modifier un device
- `DELETE /api/devices/{id}` - Supprimer un device

### Rooms (1 endpoint)
- `GET /api/rooms/status` - Statut de toutes les salles

### Sensors (2 endpoints)
- `GET /api/sensors/{sensorId}/measurements` - Historique des mesures
- `POST /api/sensors/{sensorId}/measurements` - Ajouter une mesure

---

## 🔧 Configuration technique

### Fichiers créés

```
├── lib/swagger.ts                    Configuration OpenAPI 3.0
├── app/api/swagger/route.ts          Endpoint JSON spec
└── app/api-docs/page.tsx             Page Swagger UI
```

### Dépendances installées

```json
{
  "swagger-jsdoc": "^6.x",
  "swagger-ui-react": "^5.x"
}
```

---

## 📝 Ajouter de nouvelles routes à la documentation

### Exemple : Documenter une nouvelle route

```typescript
/**
 * @swagger
 * /api/buildings:
 *   get:
 *     summary: Récupérer tous les bâtiments
 *     description: Liste tous les bâtiments avec leurs salles
 *     tags:
 *       - Buildings
 *     responses:
 *       200:
 *         description: Liste des bâtiments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       address:
 *                         type: string
 */
export async function GET() {
  // Votre code...
}
```

### Syntaxe JSDoc Swagger

Les annotations suivent la **spécification OpenAPI 3.0** :

- `@swagger` : Début de l'annotation
- Tags disponibles : `Devices`, `Sensors`, `Rooms`, `Buildings`, `Commands`, `NFC`
- Paramètres : `path`, `query`, `body`
- Réponses : codes HTTP (200, 201, 400, 404, 500)

---

## 🎨 Personnaliser Swagger UI

### Changer le titre et la description

Éditez `/lib/swagger.ts` :

```typescript
info: {
  title: 'Votre Titre',
  version: '2.0.0',
  description: 'Votre description',
}
```

### Ajouter un serveur

```typescript
servers: [
  {
    url: 'https://api.production.com',
    description: 'Production',
  },
]
```

### Ajouter des tags

```typescript
tags: [
  {
    name: 'MonTag',
    description: 'Description de mon tag',
  },
]
```

---

## 📖 Schémas disponibles

Les schémas suivants sont déjà définis dans `lib/swagger.ts` :

- **Device** : Modèle complet d'un device IoT
- **Room** : Modèle d'une salle
- **RoomStatus** : Statut temps réel d'une salle
- **Sensor** : Modèle d'un capteur
- **Measurement** : Modèle d'une mesure
- **Error** : Format d'erreur standard
- **Success** : Format de succès standard

### Utiliser un schéma

```yaml
schema:
  $ref: '#/components/schemas/Device'
```

---

## 🔐 Ajouter l'authentification à Swagger

### 1. Définir la sécurité dans swagger.ts

```typescript
components: {
  securitySchemes: {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    },
  },
}
```

### 2. Appliquer à une route

```typescript
/**
 * @swagger
 * /api/devices:
 *   get:
 *     security:
 *       - bearerAuth: []
 */
```

---

## 🌐 Exporter la spécification OpenAPI

### Endpoint JSON

La spécification complète est disponible en JSON :

```
http://localhost:3000/api/swagger
```

### Télécharger le fichier

```bash
curl http://localhost:3000/api/swagger > openapi.json
```

### Utiliser avec d'autres outils

- **Postman** : Importer le JSON
- **Insomnia** : Importer le JSON
- **Code génération** : Utiliser avec openapi-generator

---

## 📊 Exemples d'utilisation

### Tester GET /api/devices

1. Aller sur http://localhost:3000/api-docs
2. Trouver `GET /api/devices`
3. Cliquer **"Try it out"**
4. (Optionnel) Ajouter un filtre :
   - `status` = `ONLINE`
5. Cliquer **"Execute"**
6. Voir la réponse JSON

### Tester POST /api/devices

1. Trouver `POST /api/devices`
2. Cliquer **"Try it out"**
3. Modifier le JSON :
   ```json
   {
     "serialNumber": "ESP32-999",
     "name": "Test Swagger",
     "status": "ONLINE",
     "batteryLevel": 100
   }
   ```
4. Cliquer **"Execute"**
5. Vérifier le code 201 (créé)

---

## 🐛 Dépannage

### Erreur : "Cannot GET /api-docs"

**Solution :**
1. Vérifiez que le serveur est démarré (`npm run dev`)
2. Vérifiez l'URL : `http://localhost:3000/api-docs`

### Swagger UI ne charge pas

**Solution :**
1. Vérifiez les logs du serveur
2. Vérifiez que swagger-ui-react est installé :
   ```bash
   npm install swagger-ui-react
   ```

### Les routes ne s'affichent pas

**Solution :**
1. Vérifiez que les annotations `@swagger` sont correctes
2. Vérifiez le chemin dans `lib/swagger.ts` :
   ```typescript
   apis: ['./app/api/**/*.ts']
   ```

### Erreur de parsing YAML

**Solution :**
- Les annotations JSDoc doivent être en YAML valide
- Attention à l'indentation
- Utilisez un validateur YAML en ligne

---

## 📚 Ressources

- [OpenAPI 3.0 Specification](https://swagger.io/specification/)
- [Swagger UI Documentation](https://swagger.io/tools/swagger-ui/)
- [swagger-jsdoc GitHub](https://github.com/Surnet/swagger-jsdoc)

---

## 🎉 Avantages de Swagger

✅ **Documentation interactive** : Testez les API directement  
✅ **Toujours à jour** : La doc est dans le code  
✅ **Standardisée** : Format OpenAPI reconnu mondialement  
✅ **Partageable** : Envoyez simplement l'URL /api-docs  
✅ **Génération de code** : Créez des clients automatiquement  

---

**🚀 Votre API est maintenant documentée de manière professionnelle !**

Accédez à : **http://localhost:3000/api-docs**

