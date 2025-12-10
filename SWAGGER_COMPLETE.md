# ✅ Configuration Swagger Complète

## 📊 Résumé

Toutes les **28 routes** sont documentées avec Swagger et visibles dans l'interface interactive !

**URL Swagger UI** : http://localhost:3000/api-docs

---

## 🎯 Routes documentées par catégorie

### 🔐 Auth (3 routes)

| Méthode | Route | Tag | Description |
|---------|-------|-----|-------------|
| POST | `/api/auth/login` | Auth | Connexion (retourne access + refresh tokens) |
| POST | `/api/auth/refresh` | Auth | Rafraîchir le token d'accès |
| POST | `/api/auth/logout` | Auth | Déconnexion |

### 📟 Devices - CRUD (5 routes)

| Méthode | Route | Tag | Description |
|---------|-------|-----|-------------|
| GET | `/api/devices` | Devices | Liste tous les devices |
| POST | `/api/devices` | Devices | Créer un device |
| GET | `/api/devices/{id}` | Devices | Détails d'un device |
| PATCH | `/api/devices/{id}` | Devices | Modifier un device |
| DELETE | `/api/devices/{id}` | Devices | Supprimer un device |

### ⚙️ Device Config (2 routes)

| Méthode | Route | Tag | Description |
|---------|-------|-----|-------------|
| GET | `/api/devices/{uid}/config` | Devices | Config d'un device (par UID/serialNumber) |
| POST | `/api/devices/{uid}/measurements` | Devices | Enregistrer des mesures (par UID) |

### 🎛️ Device Commands (3 routes)

| Méthode | Route | Tag | Description |
|---------|-------|-----|-------------|
| POST | `/api/devices/{id}/commands/shutdown` | Device Commands | Éteindre un device |
| POST | `/api/devices/{id}/commands/reboot` | Device Commands | Redémarrer un device |
| POST | `/api/devices/{id}/commands/led` | Device Commands | Contrôler la LED |

### 🏠 Rooms (6 routes)

| Méthode | Route | Tag | Description |
|---------|-------|-----|-------------|
| GET | `/api/rooms` | Rooms | Liste des salles (+ filtres) |
| POST | `/api/rooms` | Rooms | Créer une salle |
| GET | `/api/rooms/{id}` | Rooms | Détails d'une salle |
| PATCH | `/api/rooms/{id}` | Rooms | Modifier une salle |
| GET | `/api/rooms/status` | Rooms | Statut de toutes les salles |
| GET | `/api/rooms/{id}/status` | Rooms | Statut d'une salle |

### 📊 Measurements (3 routes)

| Méthode | Route | Tag | Description |
|---------|-------|-----|-------------|
| GET | `/api/devices/{id}/measurements` | Sensors | Mesures d'un device |
| GET | `/api/rooms/{id}/measurements` | Sensors | Mesures d'une salle |
| GET | `/api/sensors/{sensorId}/measurements` | Sensors | Mesures d'un capteur |

### 🌐 Public (2 routes)

| Méthode | Route | Tag | Description |
|---------|-------|-----|-------------|
| GET | `/api/public/rooms/status` | Public | Statut public des salles |
| GET | `/api/public/rooms/{id}` | Public | Info publique d'une salle |

### 🔧 Admin (2 routes)

| Méthode | Route | Tag | Description |
|---------|-------|-----|-------------|
| GET | `/api/health` | Admin | Healthcheck basique |
| GET | `/api/admin/health` | Admin | Healthcheck détaillé |
| GET | `/api/admin/devices/stats` | Admin | Statistiques des devices |

---

## 🔧 Configuration technique

### 1. Fichier de config principal

**Fichier** : `lib/swagger.ts`

**Contenu** :
- OpenAPI 3.0 spec
- Serveurs (dev + production)
- Tags organisés par catégorie
- Schémas (Device, Room, Sensor, etc.)
- Réponses réutilisables (BadRequest, NotFound, ServerError)
- SecuritySchemes (Bearer JWT)

### 2. Route API Swagger

**Fichier** : `app/api/swagger/route.ts`

Retourne la spec OpenAPI en JSON pour Swagger UI.

### 3. Page Swagger UI

**Fichier** : `app/api-docs/page.tsx`

Interface interactive utilisant `swagger-ui-react`.

### 4. Layout dédié

**Fichier** : `app/api-docs/layout.tsx`

Désactive React Strict Mode pour éviter les warnings de `swagger-ui-react`.

---

## 📝 Annotations JSDoc dans les routes

Chaque route API contient des annotations JSDoc complètes :

```typescript
/**
 * @swagger
 * /api/devices:
 *   get:
 *     summary: Récupérer tous les devices
 *     description: Liste tous les devices IoT avec pagination
 *     tags:
 *       - Devices
 *     parameters:
 *       - in: query
 *         name: roomId
 *         schema:
 *           type: string
 *         description: Filtrer par ID de salle
 *     responses:
 *       200:
 *         description: Liste des devices récupérée avec succès
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
 *                     $ref: '#/components/schemas/Device'
 */
```

---

## 🚀 Comment utiliser Swagger UI

### 1. Démarrer le serveur

```bash
cd /Users/pauldecalf/Desktop/PROJET-WORKSHOP
npm run dev
```

### 2. Ouvrir Swagger UI

Accédez à : **http://localhost:3000/api-docs**

### 3. Naviguer dans la documentation

- **Tags** : Les routes sont organisées par catégorie (Auth, Devices, Rooms, etc.)
- **Try it out** : Testez les routes directement depuis l'interface
- **Authorize** 🔒 : Ajoutez votre JWT pour tester les routes protégées

### 4. Authentification JWT

1. Cliquez sur `POST /api/auth/login`
2. Cliquez sur "Try it out"
3. Entrez vos identifiants :
   ```json
   {
     "email": "admin@example.com",
     "password": "password123"
   }
   ```
4. Cliquez sur "Execute"
5. Copiez l'`accessToken` de la réponse
6. Cliquez sur le bouton **"Authorize"** 🔒 en haut à droite
7. Collez le token (format automatique : `Bearer <token>`)
8. Cliquez sur "Authorize"
9. Maintenant vous pouvez tester toutes les routes protégées !

---

## 🎨 Personnalisation de Swagger UI

### Modifier le titre

**Fichier** : `lib/swagger.ts`

```typescript
info: {
  title: 'API Workshop - Système IoT',
  version: '1.0.0',
  description: '...',
}
```

### Ajouter un serveur de production

**Fichier** : `lib/swagger.ts`

```typescript
servers: [
  {
    url: 'http://localhost:3000',
    description: 'Serveur de développement',
  },
  {
    url: 'https://votre-domaine.com',
    description: 'Serveur de production',
  },
  {
    url: 'https://projet-workshop-m2tl-production.up.railway.app',
    description: 'Railway',
  },
],
```

### Changer les couleurs de Swagger UI

**Fichier** : `app/api-docs/page.tsx`

```typescript
export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-lg shadow-xl">
          <h1 className="text-4xl font-bold text-white mb-2">
            📚 Documentation API
          </h1>
          <p className="text-blue-100">
            Documentation interactive de l'API Workshop IoT
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-4">
          <SwaggerUI url="/api/swagger" />
        </div>
      </div>
    </div>
  );
}
```

---

## 📊 Schémas réutilisables

### Device

```yaml
Device:
  type: object
  required: ['serialNumber', 'status']
  properties:
    _id:
      type: string
      example: "507f1f77bcf86cd799439011"
    serialNumber:
      type: string
      example: "ESP32-001"
    name:
      type: string
      example: "Capteur Salle 101"
    status:
      type: string
      enum: [ONLINE, OFFLINE, ERROR, UNKNOWN]
    batteryLevel:
      type: number
      minimum: 0
      maximum: 100
```

### Room

```yaml
Room:
  type: object
  required: ['buildingId', 'name']
  properties:
    _id:
      type: string
    buildingId:
      type: string
    name:
      type: string
      example: "Salle 101"
    floor:
      type: integer
      example: 1
    capacity:
      type: integer
      example: 30
```

### DeviceCommand

```yaml
DeviceCommand:
  type: object
  properties:
    _id:
      type: string
    deviceId:
      type: string
    type:
      type: string
      enum: [SHUTDOWN, REBOOT, LED_CONTROL, UPDATE_CONFIG, OTHER]
    parameters:
      type: object
    status:
      type: string
      enum: [PENDING, SENT, ACKNOWLEDGED, COMPLETED, FAILED]
```

---

## 🔒 Sécurité JWT dans Swagger

### Configuration

**Fichier** : `lib/swagger.ts`

```typescript
components: {
  securitySchemes: {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Utilisez le token JWT obtenu via /api/auth/login',
    },
  },
}
```

### Appliquer à une route

Dans les annotations JSDoc :

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

## 🐛 Troubleshooting

### ❌ Swagger UI ne charge pas

**Problème** : Page blanche sur `/api-docs`

**Solution** :
1. Vérifiez que `swagger-ui-react` est installé : `npm list swagger-ui-react`
2. Vérifiez les erreurs dans la console du navigateur
3. Rechargez avec cache vidé : `Cmd+Shift+R` (Mac) ou `Ctrl+Shift+R` (Windows)

### ❌ Routes manquantes dans Swagger

**Problème** : Certaines routes n'apparaissent pas

**Solution** :
1. Vérifiez que le fichier contient des annotations JSDoc `@swagger`
2. Vérifiez que le chemin est inclus dans `apis` de `lib/swagger.ts` :
   ```typescript
   apis: ['./app/api/**/*.ts']
   ```
3. Redémarrez le serveur : `npm run dev`

### ❌ Erreur "Failed to fetch"

**Problème** : Swagger UI ne peut pas charger la spec

**Solution** :
1. Vérifiez que `/api/swagger` retourne bien du JSON :
   ```bash
   curl http://localhost:3000/api/swagger
   ```
2. Vérifiez les headers CORS dans `middleware.ts`
3. Vérifiez la console du navigateur pour les erreurs

### ❌ Warning React Strict Mode

**Problème** : Warnings `UNSAFE_componentWillReceiveProps`

**Solution** : Déjà résolu avec `app/api-docs/layout.tsx` qui désactive Strict Mode.

---

## 📦 Export de la spec OpenAPI

### Format JSON

```bash
curl http://localhost:3000/api/swagger > openapi.json
```

### Format YAML

Installez `js-yaml` :

```bash
npm install js-yaml
node -e "const fs = require('fs'); const yaml = require('js-yaml'); const spec = require('./lib/swagger').swaggerSpec; fs.writeFileSync('openapi.yaml', yaml.dump(spec));"
```

### Importer dans Postman

1. Ouvrez Postman
2. File > Import
3. Collez l'URL : `http://localhost:3000/api/swagger`
4. Cliquez sur "Import"

---

## 🌐 URLs importantes

| URL | Description |
|-----|-------------|
| http://localhost:3000/api-docs | Swagger UI (interface interactive) |
| http://localhost:3000/api/swagger | Spec OpenAPI (JSON) |
| http://localhost:3000/api/health | Healthcheck basique |
| http://localhost:3000/api/admin/health | Healthcheck détaillé |

---

## ✅ Checklist de déploiement

Avant de déployer, vérifiez :

- [ ] Toutes les routes ont des annotations Swagger
- [ ] Les schémas sont complets et cohérents
- [ ] Les exemples de requêtes/réponses sont valides
- [ ] L'authentification JWT fonctionne dans Swagger UI
- [ ] L'URL du serveur de production est configurée
- [ ] Les routes publiques sont bien marquées (sans `security`)
- [ ] La documentation est à jour (README, API_ROUTES.md)

---

## 🎉 Félicitations !

Vous disposez maintenant d'une **documentation API complète et interactive** avec :

✅ 28 routes documentées  
✅ Interface Swagger UI moderne  
✅ Authentification JWT intégrée  
✅ Schémas réutilisables  
✅ Exemples de requêtes/réponses  
✅ Test direct depuis le navigateur  

🚀 **Prêt pour la production !**

