# 💡 Astuces de Développement

## 🐛 Bug connu : Routes API 404 en développement

### Symptôme

Vos routes API retournent 404 même si le code est correct :
```
POST /api/devices 404
GET /api/devices 200  ✅ (mais POST ne fonctionne pas)
```

### Cause

**Bug de hot-reload de Turbopack** dans Next.js 16. Après certaines modifications de fichiers, Turbopack ne recharge pas correctement toutes les méthodes HTTP (GET fonctionne mais POST/PATCH/DELETE non).

### Solution rapide

```bash
# Option 1 : Script npm
npm run fix-routes

# Option 2 : Commande manuelle
touch app/api/devices/route.ts

# Option 3 : Touch toutes les routes
find app/api -name "route.ts" -exec touch {} \;
```

Attendez 2-3 secondes puis réessayez votre requête.

---

## 🔄 Quand utiliser `npm run fix-routes`

Utilisez cette commande quand :
- ✅ Une route retourne 404 alors qu'elle existe
- ✅ GET fonctionne mais POST/PATCH/DELETE ne fonctionnent pas
- ✅ Après un `git pull` ou checkout de branche
- ✅ Après modification de plusieurs fichiers de routes
- ✅ Le serveur dev ne détecte pas vos changements

---

## 🚀 Workflow de développement recommandé

### 1. Démarrer le projet

```bash
# Terminal 1 : Serveur dev
npm run dev

# Si MongoDB pas encore lancé
# Terminal 2 : MongoDB local (optionnel si vous utilisez Atlas)
mongod
```

### 2. Travailler sur les routes API

```bash
# Modifier vos fichiers de routes
# Si une route retourne 404
npm run fix-routes

# Retester
curl -X POST http://localhost:3000/api/devices -H "Content-Type: application/json" -d '{"serialNumber":"TEST"}'
```

### 3. Tester les modifications

```bash
# Swagger UI (interface graphique)
open http://localhost:3000/api-docs

# cURL (ligne de commande)
curl http://localhost:3000/api/devices

# Browser
open http://localhost:3000/api/devices
```

---

## 🧪 Scripts npm disponibles

| Script | Description | Usage |
|--------|-------------|-------|
| `npm run dev` | Serveur de développement | Développement quotidien |
| `npm run build` | Build production | Avant déploiement |
| `npm start` | Serveur production | Après build |
| `npm run lint` | Vérifier le code | Avant commit |
| `npm run seed` | Initialiser la BDD | Première fois ou reset |
| `npm run fix-routes` | Fix routes 404 | Quand routes ne fonctionnent pas |

---

## 🔧 Problèmes fréquents et solutions

### 1. MongoDB ne se connecte pas

**Erreur** :
```
MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017
```

**Solutions** :
```bash
# Vérifier que MongoDB tourne
mongosh

# Ou démarrer MongoDB
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongodb

# Ou utilisez MongoDB Atlas (cloud)
```

### 2. Port 3000 déjà utilisé

**Erreur** :
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solutions** :
```bash
# Trouver le processus
lsof -ti:3000

# Tuer le processus
kill -9 $(lsof -ti:3000)

# Ou utiliser un autre port
PORT=3001 npm run dev
```

### 3. Module non trouvé après install

**Erreur** :
```
Module not found: Can't resolve '@/lib/mongodb'
```

**Solutions** :
```bash
# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install

# Redémarrer le serveur
npm run dev
```

### 4. Build échoue

**Erreur** :
```
Build failed
Type error: ...
```

**Solutions** :
```bash
# Nettoyer le cache
rm -rf .next

# Rebuild
npm run build

# Si ça persiste, vérifier les types
npm run lint
```

---

## 📝 Bonnes pratiques

### 1. Toujours tester localement avant de push

```bash
# Build production en local
npm run build

# Lancer en mode production
npm start

# Tester que tout fonctionne
curl http://localhost:3000/api/devices
```

### 2. Utiliser Swagger UI pour tester

Au lieu de cURL, utilisez l'interface graphique :
```
http://localhost:3000/api-docs
```

Avantages :
- ✅ Interface interactive
- ✅ Pas besoin de mémoriser les commandes cURL
- ✅ Exemples de données pré-remplis
- ✅ Visualisation des réponses formatées

### 3. Versionner vos données de test

Créez des fixtures pour tester rapidement :

```typescript
// test/fixtures/devices.ts
export const testDevices = [
  {
    serialNumber: "TEST-001",
    name: "Device Test 1",
    status: "ONLINE",
    batteryLevel: 100
  },
  // ...
];
```

### 4. Logger efficacement

Dans vos routes API, ajoutez des logs utiles :

```typescript
export async function POST(request: NextRequest) {
  console.log('📥 POST /api/devices - Body:', await request.json());
  
  try {
    // Votre code...
    console.log('✅ Device créé:', device._id);
  } catch (error) {
    console.error('❌ Erreur POST /api/devices:', error);
  }
}
```

---

## 🎯 Raccourcis utiles

```bash
# Démarrage rapide complet
npm install && npm run seed && npm run dev

# Réinitialisation complète
rm -rf node_modules .next package-lock.json && npm install && npm run dev

# Fix rapide des routes 404
npm run fix-routes

# Test rapide de toutes les routes
curl http://localhost:3000/api/devices && \
curl http://localhost:3000/api/rooms/status && \
curl http://localhost:3000/api/swagger
```

---

## 🔗 Ressources utiles

- [Next.js Docs](https://nextjs.org/docs)
- [MongoDB Docs](https://www.mongodb.com/docs/)
- [Mongoose Docs](https://mongoosejs.com/docs/)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)

---

## 🆘 Besoin d'aide ?

1. **Consultez la documentation** : Tous les fichiers `*.md` à la racine
2. **Vérifiez les logs** : Terminal où tourne `npm run dev`
3. **Testez avec Swagger UI** : http://localhost:3000/api-docs
4. **Exécutez les diagnostics** :
   ```bash
   npm run fix-routes
   npm run lint
   ```

---

**💡 Astuce finale** : Ajoutez `npm run fix-routes` à vos alias shell :

```bash
# Dans ~/.zshrc ou ~/.bashrc
alias fix-routes="npm run fix-routes"

# Puis utilisez simplement
fix-routes
```

